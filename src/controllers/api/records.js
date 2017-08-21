import models from '../../models'
import logger from '../../utils/logger'
import util from 'util'

const exec = util.promisify(require('child_process').exec)
const log = logger(module)
const recordsController = {}

async function query (d) {
  const cmdStr = `/home/cyber/http_query_tool.tool ${d} www.cloud.urlsec.qq.com 140 rVQ25ruX3GeqQsiCJCWZHvcZaOxRdcB7 80 1.0`
  const { stdout, stderr } = await exec(cmdStr)
  if (stderr) {
    return null
  } else {
    const data = stdout.match(/\{"echostr".*\}/)[0]
    return JSON.parse(data)['url_attr'][0]
  }
}

recordsController.show = async (ctx, next) => {
/* 注意这里有两个正则：
正则1. 规范dname，只要域名，不需要协议类型，例如http://www.baidu.com，则只需要baidu.com，此外防止别人使用api查询时使用垃圾数据，导致将大量垃圾数据写入数据库
正则2. 有些域名的二级域名仍然是公用顶级域名，此时获取三级域名 */
  try {
    const dname = ctx.query.dname.match(/(?:\w+\.){1,}\w+/)[0]
    if (dname) {
      let record = await models.Record.findOne({
        attributes: ['dname', 'urltype', 'evilclass'],
        where: {
          dname: dname
        }
      })
      if (record) {
        ctx.rest({
          code: 'success',
          message: 'Showed a domain name successfully',
          data: record
        })
      } else {
        const queryRecord = await query(dname)
        if (queryRecord) {
          const sldName = dname.match('\.(?:com|net|org|gov|ac|co)\.[^\.]+$') ? dname.split('.').splice(-3).join('.') : dname.split('.').splice(-2).join('.')
          const [sld, created] = await models.Sld.findCreateFind({
            where: {
              dname: sldName
            },
            defaults: {
              dname: sldName
            }
          })
          await models.Record.create(Object.assign(queryRecord, {sld_id: sld.id, dname: dname}))
          ctx.rest({
            code: 'success',
            message: 'Showed a domain name successfully',
            data: {
              dname: dname,
              urltype: queryRecord.urltype,
              evilclass: queryRecord.evilclass
            }
          })
        } else {
          throw new ctx.APIError('records:show_error', 'No such queryRecord')
        }
      }
    } else {
      throw new ctx.APIError('records:show_error', 'dname format error')
    }
  } catch (e) {
    log.error(e)
    if (e instanceof ctx.APIError) {
      throw e
    } else {
      throw new ctx.APIError('records:show_error', e)
    }
  }
}

recordsController.display = async (ctx, next) => {
  try {
    const dnamesStr = ctx.request.body['dnames']
    const dnames = JSON.parse(dnamesStr)
    if (dnames) {
      if (dnames.length > 20) {
        throw new ctx.APIError('records:display_error', 'MAX limit 20/request')
      }
      let records = await models.Record.findAll({
        attributes: ['dname', 'urltype', 'evilclass'],
        where: {
          dname: dnames
        }
      }).catch(e => [])
      const seenDnames = records.map(record => record.dname)
      const notSeenDnames = dnames.filter(dname => {
        if (seenDnames.includes(dname)) {
          return false
        } else {
          return true
        }
      })
      let queriedLite = []
      if (notSeenDnames) {
        const queriedRecords = await Promise.all(notSeenDnames.map(query)).catch(e => [])
        queriedLite = queriedRecords.map(x => ({dname: x.url, urltype: x.urltype, evilclass: x.evilclass}))
      }
      const rv = [...records, ...queriedLite]
      if (rv) {
        ctx.rest({
          code: 'success',
          message: 'Displayed some domain names successfully',
          data: records
        })
      } else {
        throw new ctx.APIError('records:display_error', 'No such queryRecord')
      }
    } else {
      throw new ctx.APIError('records:display_error', 'dname format error')
    }
  } catch (e) {
    log.error(e)
    if (e instanceof ctx.APIError) {
      throw e
    } else {
      throw new ctx.APIError('records:display_error', e)
    }
  }
}

export default recordsController

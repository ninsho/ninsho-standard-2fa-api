import { MemberInsert } from 'ninsho-base'
import { MailerStorage } from 'ninsho-module-mailer'
import { TestHook, TestHookFail, initializeLocalPlugin } from './x-service'

const { pool, plugin } = initializeLocalPlugin()

describe('st-delete-first', () => {

  const user = {
    name: 'test_user',
    mail: 'test@localhost_com',
    pass: 'test1234',
    newEmail: 'new@localhost_com',
    ip: '127.0.0.1',
    sessionDevice: 'test-client',
    view_name: 'is test view',
    tel: '000-0000-0001'
  }

  type MCustomT = Partial<{
    view_name: string,
    tel: string
  }>

  const create = async () => {
    const res_first = await plugin.createUser2faFirst<MCustomT>(
      user.name,
      user.mail,
      user.pass,
      user.ip,
      {
        view_name: user.view_name,
        tel: user.tel
      }
    )
    if (res_first.fail()) throw 100
    const res_verify = await plugin.createUser2faVerify(
      res_first.system.one_time_password,
      res_first.body.alternate_token,
      user.ip,
      user.sessionDevice
    )
    if (res_verify.fail()) throw 200
    return res_verify
  }

  // =====
  // ===== test
  // =====

  it('200: Positive case', async () => {
    const res1_create = await create()
    // test
    const res1 = await plugin.deleteUser2faFirst(
      res1_create.body.session_token,
      user.ip,
      user.sessionDevice
    )
    if (res1.fail()) throw 1
    expect(res1.statusCode).toEqual(200)
  })

  it('200: hook: beforePasswordCheck', async () => {
    const res1_create = await create()
    // test
    const res1 = await plugin.deleteUser2faFirst(
      res1_create.body.session_token,
      user.ip,
      user.sessionDevice, {
        hooks: [
          {
            hookPoint: 'beforePasswordCheck',
            hook: TestHook()
          }
        ]
      }
    )
    if (res1.fail()) throw 1
    expect(res1.statusCode).toEqual(200)
  })

  it('500: fail hook: beforePasswordCheck', async () => {
    const res1_create = await create()
    // test
    const res1 = await plugin.deleteUser2faFirst(
      res1_create.body.session_token,
      user.ip,
      user.sessionDevice, {
        hooks: [
          {
            hookPoint: 'beforePasswordCheck',
            hook: TestHookFail()
          }
        ]
      }
    )
    if (!!!res1.fail()) throw 1
    expect(res1.statusCode).toEqual(500)
  })

  it('200: hook: onTransactionLast', async () => {
    const res1_create = await create()
    // test
    const res1 = await plugin.deleteUser2faFirst(
      res1_create.body.session_token,
      user.ip,
      user.sessionDevice, {
        hooks: [
          {
            hookPoint: 'onTransactionLast',
            hook: TestHook()
          }
        ]
      }
    )
    if (res1.fail()) throw 1
    expect(res1.statusCode).toEqual(200)
  })

  it('500: fail hook: onTransactionLast', async () => {
    const res1_create = await create()
    // test
    const res1 = await plugin.deleteUser2faFirst(
      res1_create.body.session_token,
      user.ip,
      user.sessionDevice, {
        hooks: [
          {
            hookPoint: 'onTransactionLast',
            hook: TestHookFail()
          }
        ]
      }
    )
    if (!!!res1.fail()) throw 1
    expect(res1.statusCode).toEqual(500)
  })

  it('200: good password', async () => {
    const res1_create = await create()
    // test
    const res1 = await plugin.deleteUser2faFirst(
      res1_create.body.session_token,
      user.ip,
      user.sessionDevice, {
        pass: user.pass
      }
    )
    if (res1.fail()) throw 1
    expect(res1.statusCode).toEqual(200)
  })

  it('200: bad password', async () => {
    const res1_create = await create()
    // test
    const res1 = await plugin.deleteUser2faFirst(
      res1_create.body.session_token,
      user.ip,
      user.sessionDevice, {
        pass: user.pass + 'XXX'
      }
    )
    if (!!!res1.fail()) throw 1
    expect(res1.statusCode).toEqual(401)
  })

  it('403: role', async () => {
    const res1_create = await create()
    // test
    const res1 = await plugin.deleteUser2faFirst(
      res1_create.body.session_token,
      user.ip,
      user.sessionDevice, {
        rolePermissionLevel: 1
      }
    )
    if (!!!res1.fail()) throw 1
    expect(res1.statusCode).toEqual(403)
  })

  it('200: sendOTPNotice', async () => {
    const res1_create = await create()
    // test
    const res1 = await plugin.deleteUser2faFirst(
      res1_create.body.session_token,
      user.ip,
      user.sessionDevice, {
        sendOTPNotice: false
      }
    )
    if (res1.fail()) throw 1
    expect(res1.statusCode).toEqual(200)
  })

  it('200: mailFormat', async () => {
    const res1_create = await create()
    // test
    const res1 = await plugin.deleteUser2faFirst(
      res1_create.body.session_token,
      user.ip,
      user.sessionDevice, {
        mailFormat: {
          subject: 'Dear {{name}} delete first subject',
          body: 'Dear {{name}} delete first body'
        }
      }
    )
    if (res1.fail()) throw 1
    expect(res1.statusCode).toEqual(200)
    expect(MailerStorage[user.mail].mailSubject).toEqual('Dear test_user delete first subject')
    expect(MailerStorage[user.mail].mailBody).toEqual('Dear test_user delete first body')
  })


  it('403: status', async () => {
    const res1_create = await create()
    // break
    await pool.updateOneOrThrow<MemberInsert>({ m_status: 9 }, { m_name: user.name }, 'AND', 'members')
    // test
    const res1 = await plugin.deleteUser2faFirst(
      res1_create.body.session_token,
      user.ip,
      user.sessionDevice
    )
    if (!!!res1.fail()) throw 1
    expect(res1.statusCode).toEqual(403)
  })

  it('200: Positive case', async () => {
    const res1_create = await create()
    // test
    const res1 = await plugin.deleteUser2faFirst(
      res1_create.body.session_token,
      user.ip,
      user.sessionDevice
    )
    if (res1.fail()) throw 1
    expect(res1.statusCode).toEqual(200)
  })
})

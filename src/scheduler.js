import cron from 'node-cron'
import { db } from './dao/db/memory.js'
import { enviarMail } from './mailer.js'

cron.schedule('* * * * *', async () => {

  const ahora = new Date()

  const pendientes = db.notifications.filter(n =>
    !n.cancelada &&
    !n.enviada &&
    new Date(n.fecha_envio) <= ahora
  )

  for (const notif of pendientes) {

    const user = db.users.find(u => u.userId === notif.userId)
    if (!user) continue

    try {
      await enviarMail({
        to: user.email,
        subject: notif.asunto,
        text: notif.mensaje
      })

      notif.enviada = true
      console.log('Mail enviado a', user.email)

    } catch (err) {
      console.error('Error enviando mail:', err)
    }
  }

})
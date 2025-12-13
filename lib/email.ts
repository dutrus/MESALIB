// lib/email.ts
import { Resend } from 'resend';

// Inicializar Resend de manera lazy solo cuando se necesite
function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'MESALIB <onboarding@resend.dev>';

/**
 * Envía email cuando se crea un nuevo match (notifica al terapeuta)
 */
export async function sendMatchCreatedEmail(
  therapistEmail: string,
  therapistName: string,
  patientName: string
) {
  const resend = getResend();
  if (!resend) {
    console.log(`📧 [MOCK] Nuevo match: ${therapistName} tiene un nuevo paciente: ${patientName}`);
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [therapistEmail],
      subject: 'Nuevo match disponible - MESALIB',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF6B9D;">¡Tienes un nuevo match disponible!</h2>
          <p>Hola ${therapistName},</p>
          <p>Un paciente (${patientName}) ha sido asignado a ti. Por favor, revisa tu dashboard para aceptar o rechazar el match.</p>
          <div style="margin: 30px 0;">
            <a href="${APP_URL}/dashboard/therapist" style="background-color: #FF6B9D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Ver solicitud
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Saludos,<br>El equipo de MESALIB</p>
        </div>
      `,
    });
    console.log(`✅ Email enviado a ${therapistEmail}`);
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    // No lanzar error para no romper el flujo principal
  }
}

/**
 * Envía email cuando un terapeuta acepta un match (notifica al paciente)
 */
export async function sendMatchAcceptedEmail(
  patientEmail: string,
  patientName: string,
  therapistName: string
) {
  const resend = getResend();
  if (!resend) {
    console.log(`📧 [MOCK] Match aceptado: ${patientName} con ${therapistName}`);
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [patientEmail],
      subject: '¡Match aceptado! - MESALIB',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF6B9D;">¡Tu match fue aceptado!</h2>
          <p>Hola ${patientName},</p>
          <p><strong>${therapistName}</strong> ha aceptado tu solicitud. Ya puedes agendar tu primera sesión.</p>
          <div style="margin: 30px 0;">
            <a href="${APP_URL}/dashboard/patient" style="background-color: #FF6B9D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Ver mi terapeuta
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Saludos,<br>El equipo de MESALIB</p>
        </div>
      `,
    });
    console.log(`✅ Email enviado a ${patientEmail}`);
  } catch (error) {
    console.error('❌ Error enviando email:', error);
  }
}

/**
 * Envía email cuando un terapeuta rechaza un match (notifica al paciente y se inicia re-matching)
 */
export async function sendMatchDeclinedEmail(patientEmail: string, patientName: string) {
  const resend = getResend();
  if (!resend) {
    console.log(`📧 [MOCK] Match rechazado: ${patientName}, iniciando re-matching...`);
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [patientEmail],
      subject: 'Buscando otro terapeuta para ti - MESALIB',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF6B9D;">Estamos buscando otro terapeuta para ti</h2>
          <p>Hola ${patientName},</p>
          <p>El terapeuta no pudo aceptar tu solicitud en este momento. No te preocupes, ya estamos buscando otro profesional que se ajuste mejor a tus necesidades.</p>
          <p>Te notificaremos cuando encontremos un nuevo match.</p>
          <div style="margin: 30px 0;">
            <a href="${APP_URL}/dashboard/patient" style="background-color: #FF6B9D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Ver mi dashboard
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Saludos,<br>El equipo de MESALIB</p>
        </div>
      `,
    });
    console.log(`✅ Email enviado a ${patientEmail}`);
  } catch (error) {
    console.error('❌ Error enviando email:', error);
  }
}

/**
 * Envía email cuando un paciente solicita una sesión (notifica al terapeuta)
 */
export async function sendSessionRequestEmail(
  therapistEmail: string,
  therapistName: string,
  patientName: string,
  sessionTime: Date
) {
  const resend = getResend();
  if (!resend) {
    console.log(`📧 [MOCK] Solicitud de sesión: ${therapistName} con ${patientName} el ${sessionTime}`);
    return;
  }

  try {
    const formattedDate = sessionTime.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = sessionTime.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [therapistEmail],
      subject: 'Nueva solicitud de sesión - MESALIB',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF6B9D;">Nueva solicitud de sesión</h2>
          <p>Hola ${therapistName},</p>
          <p><strong>${patientName}</strong> ha solicitado una sesión para:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 18px;"><strong>${formattedDate}</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 16px;">${formattedTime}</p>
          </div>
          <div style="margin: 30px 0;">
            <a href="${APP_URL}/dashboard/therapist" style="background-color: #FF6B9D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Confirmar sesión
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Saludos,<br>El equipo de MESALIB</p>
        </div>
      `,
    });
    console.log(`✅ Email enviado a ${therapistEmail}`);
  } catch (error) {
    console.error('❌ Error enviando email:', error);
  }
}

/**
 * Envía email cuando una sesión es confirmada (notifica a ambos)
 */
export async function sendSessionConfirmedEmail(
  userEmail: string,
  userName: string,
  therapistName: string,
  sessionTime: Date
) {
  const resend = getResend();
  if (!resend) {
    console.log(`📧 [MOCK] Sesión confirmada: ${userName} el ${sessionTime}`);
    return;
  }

  try {
    const formattedDate = sessionTime.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = sessionTime.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [userEmail],
      subject: 'Sesión confirmada - MESALIB',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF6B9D;">Sesión confirmada</h2>
          <p>Hola ${userName},</p>
          <p>Tu sesión con <strong>${therapistName}</strong> ha sido confirmada:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 18px;"><strong>${formattedDate}</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 16px;">${formattedTime}</p>
          </div>
          <div style="margin: 30px 0;">
            <a href="${APP_URL}/dashboard" style="background-color: #FF6B9D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Ver detalles
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Saludos,<br>El equipo de MESALIB</p>
        </div>
      `,
    });
    console.log(`✅ Email enviado a ${userEmail}`);
  } catch (error) {
    console.error('❌ Error enviando email:', error);
  }
}

/**
 * Envía recordatorio 24h antes de una sesión (notifica a ambos)
 */
export async function sendSessionReminderEmail(
  userEmail: string,
  userName: string,
  therapistName: string,
  sessionTime: Date
) {
  const resend = getResend();
  if (!resend) {
    console.log(`📧 [MOCK] Recordatorio: ${userName} tiene sesión mañana con ${therapistName}`);
    return;
  }

  try {
    const formattedDate = sessionTime.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = sessionTime.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [userEmail],
      subject: 'Recordatorio: Tu sesión es mañana - MESALIB',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF6B9D;">Recordatorio de sesión</h2>
          <p>Hola ${userName},</p>
          <p>Te recordamos que tienes una sesión con <strong>${therapistName}</strong> mañana:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 18px;"><strong>${formattedDate}</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 16px;">${formattedTime}</p>
          </div>
          <p>¡Nos vemos pronto!</p>
          <div style="margin: 30px 0;">
            <a href="${APP_URL}/dashboard" style="background-color: #FF6B9D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Ver detalles
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Saludos,<br>El equipo de MESALIB</p>
        </div>
      `,
    });
    console.log(`✅ Email enviado a ${userEmail}`);
  } catch (error) {
    console.error('❌ Error enviando email:', error);
  }
}




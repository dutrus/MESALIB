// app/api/notify/route.ts
// API route para enviar notificaciones por email desde el servidor

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  sendMatchCreatedEmail,
  sendMatchAcceptedEmail,
  sendMatchDeclinedEmail,
} from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!supabaseAdmin) {
      console.error('❌ Supabase admin client no disponible');
      return NextResponse.json(
        { error: 'Servicio no disponible' },
        { status: 503 }
      );
    }

    switch (type) {
      case 'match_created': {
        const { therapistUserId, patientName } = data;
        
        // Obtener email del terapeuta
        const { data: therapistUser, error: userError } = await supabaseAdmin.auth.admin.getUserById(
          therapistUserId
        );

        if (userError || !therapistUser?.user?.email) {
          console.error('Error obteniendo usuario terapeuta:', userError);
          return NextResponse.json(
            { error: 'No se pudo obtener el email del terapeuta' },
            { status: 400 }
          );
        }

        // Obtener nombre del terapeuta
        const { data: therapistProfile } = await supabaseAdmin
          .from('therapist_profiles')
          .select('name')
          .eq('user_id', therapistUserId)
          .single();

        await sendMatchCreatedEmail(
          therapistUser.user.email,
          therapistProfile?.name || 'Terapeuta',
          patientName
        );

        return NextResponse.json({ success: true });
      }

      case 'match_accepted': {
        const { patientUserId, therapistName } = data;
        
        // Obtener email del paciente
        const { data: patientUser, error: userError } = await supabaseAdmin.auth.admin.getUserById(
          patientUserId
        );

        if (userError || !patientUser?.user?.email) {
          console.error('Error obteniendo usuario paciente:', userError);
          return NextResponse.json(
            { error: 'No se pudo obtener el email del paciente' },
            { status: 400 }
          );
        }

        // Obtener nombre del paciente
        const { data: patientProfile } = await supabaseAdmin
          .from('patient_profiles')
          .select('name')
          .eq('user_id', patientUserId)
          .single();

        await sendMatchAcceptedEmail(
          patientUser.user.email,
          patientProfile?.name || 'Paciente',
          therapistName
        );

        return NextResponse.json({ success: true });
      }

      case 'match_declined': {
        const { patientUserId } = data;
        
        // Obtener email del paciente
        const { data: patientUser, error: userError } = await supabaseAdmin.auth.admin.getUserById(
          patientUserId
        );

        if (userError || !patientUser?.user?.email) {
          console.error('Error obteniendo usuario paciente:', userError);
          return NextResponse.json(
            { error: 'No se pudo obtener el email del paciente' },
            { status: 400 }
          );
        }

        // Obtener nombre del paciente
        const { data: patientProfile } = await supabaseAdmin
          .from('patient_profiles')
          .select('name')
          .eq('user_id', patientUserId)
          .single();

        await sendMatchDeclinedEmail(
          patientUser.user.email,
          patientProfile?.name || 'Paciente'
        );

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: 'Tipo de notificación no válido' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Error en API de notificaciones:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}






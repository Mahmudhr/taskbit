'use client';

import EnterOtpForm from '@/components/forms/enter-otp-form';
import ForgotPasswordForm from '@/components/forms/forgot-password-form';
import UserPasswordChangeForm from '@/components/forms/user-password-change-form';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [sendLink, setSendLink] = useState(false);
  const [matchOtp, setMatchOtp] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background'>
      {matchOtp ? (
        <UserPasswordChangeForm
          otp={otp}
          email={email}
          setEmail={setEmail}
          setOtp={setOtp}
        />
      ) : sendLink ? (
        <EnterOtpForm setMatchOtp={setMatchOtp} email={email} setOtp={setOtp} />
      ) : (
        <ForgotPasswordForm setSendLink={setSendLink} setEmail={setEmail} />
      )}
    </div>
  );
}

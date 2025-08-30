'use client';

import { useFetchEmployeeOfTheMonth } from '@/hooks/use-employee-of-the-month';
import { useSession } from 'next-auth/react';
import Lottie from 'lottie-react';
import lottieAnimation from '@/public/gift-animation.json';
import { useState } from 'react';
import AlertModal from './alert-modal';
import UpdateEmployeeOfTheMonthStatus from './forms/update-employee-of-the-month-status';

export default function HeaderGiftBox() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className='-mt-2'>
      <Lottie
        animationData={lottieAnimation}
        loop
        autoplay
        style={{ height: 42, width: 42 }}
        onClick={() => setOpenModal(true)}
      />
      <AlertModal
        isOpen={openModal}
        setIsOpen={setOpenModal}
        title=' '
        description=' '
        hideClose={true}
      >
        <UpdateEmployeeOfTheMonthStatus setIsOpen={setOpenModal} />
      </AlertModal>
    </div>
  );
}

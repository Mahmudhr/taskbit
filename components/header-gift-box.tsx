'use client';

import Lottie from 'lottie-react';
import lottieAnimation from '@/public/gift-animation.json';
import { useEffect, useState } from 'react';
import AlertModal from './alert-modal';
import UpdateEmployeeOfTheMonthStatus from './forms/update-employee-of-the-month-status';
import Confetti from 'react-confetti';
import { useSession } from 'next-auth/react';
import { useFetchEmployeeOfTheMonth } from '@/hooks/use-employee-of-the-month';
import dayjs from 'dayjs';

export default function HeaderGiftBox() {
  const [openModal, setOpenModal] = useState(false);

  const { data: session } = useSession();
  const email = session?.user?.email ?? '';

  const { data: userEom } = useFetchEmployeeOfTheMonth(email);
  const { data } = useFetchEmployeeOfTheMonth(email);

  const currentMonth = dayjs().month() + 1;

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
      const onResize = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
      };
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }
  }, []);

  return (
    currentMonth === data?.month && (
      <div className='-mt-2'>
        {/* Render confetti outside the modal and above it when user has an unviewed entry */}
        {openModal && userEom && !userEom.is_view && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              zIndex: 10000001,
              pointerEvents: 'none',
            }}
          >
            <Confetti
              width={width}
              height={height}
              recycle={false}
              numberOfPieces={600}
            />
          </div>
        )}
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
          // Make overlay transparent and raise z-index so confetti appears above everything
          // overlayClassName='bg-black/20 z-[9999999]'
        >
          <UpdateEmployeeOfTheMonthStatus setIsOpen={setOpenModal} />
        </AlertModal>
      </div>
    )
  );
}

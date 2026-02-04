import React, { useState, useEffect } from 'react';

const MaintenancePage = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date('2026-02-05T07:00:00');

    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60),
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black opacity-20'></div>

      {/* Animated background circles */}
      <div className='absolute top-20 left-20 w-72 h-72 bg-gray-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse'></div>
      <div className='absolute bottom-20 right-20 w-72 h-72 bg-gray-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000'></div>

      <div className='relative z-10 max-w-2xl w-full'>
        <div className='bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-white border-opacity-20'>
          {/* Icon */}
          <div className='flex justify-center mb-6'>
            <div className='relative'>
              <div className='absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-300 rounded-full blur-lg opacity-50 animate-pulse'></div>
              <div className='relative bg-white bg-opacity-10 rounded-full p-6'>
                <svg
                  className='w-16 h-16 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                  ></path>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                  ></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className='text-4xl md:text-5xl font-bold text-white text-center mb-4'>
            Taskbit
          </h1>

          {/* Subtitle */}
          <p className='text-xl md:text-2xl text-white text-opacity-90 text-center mb-8'>
            Under Maintenance
          </p>

          {/* Description */}
          <p className='text-white text-opacity-80 text-center mb-8 text-lg'>
            We&apos;re currently performing scheduled maintenance to improve
            your experience. We&apos;ll be back soon!
          </p>

          {/* Countdown Timer */}
          <div className='bg-white bg-opacity-10 rounded-2xl p-6 mb-8 backdrop-blur-sm'>
            <p className='text-white text-opacity-90 text-center mb-4 text-sm uppercase tracking-wider'>
              Back Online In
            </p>
            <div className='flex justify-center gap-4'>
              <div className='text-center'>
                <div className='bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg p-3 min-w-[70px]'>
                  <div className='text-3xl font-bold text-white'>
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                </div>
                <div className='text-white text-opacity-70 text-xs mt-2 uppercase'>
                  Hours
                </div>
              </div>
              <div className='text-center'>
                <div className='bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg p-3 min-w-[70px]'>
                  <div className='text-3xl font-bold text-white'>
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                </div>
                <div className='text-white text-opacity-70 text-xs mt-2 uppercase'>
                  Minutes
                </div>
              </div>
              <div className='text-center'>
                <div className='bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg p-3 min-w-[70px]'>
                  <div className='text-3xl font-bold text-white'>
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                </div>
                <div className='text-white text-opacity-70 text-xs mt-2 uppercase'>
                  Seconds
                </div>
              </div>
            </div>
          </div>

          {/* Expected Time */}
          <div className='text-center'>
            <p className='text-white text-opacity-70 text-sm'>
              Expected return:{' '}
              <span className='font-semibold text-white'>
                6:00 AM, February 5th, 2026
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className='text-white text-opacity-60 text-center mt-6 text-sm'>
          Thank you for your patience and understanding
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;

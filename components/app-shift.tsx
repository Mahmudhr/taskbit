const AppShiftedPage = () => {
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

          {/* Redirect Section */}
          <div className='bg-gradient-to-r from-gray-700 to-gray-900 rounded-2xl p-6 border border-white border-opacity-20'>
            <div className='text-center mb-4'>
              <svg
                className='w-12 h-12 text-white mx-auto mb-3 opacity-80'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M13 10V3L4 14h7v7l9-11h-7z'
                ></path>
              </svg>
              <h3 className='text-xl font-semibold text-white mb-2'>
                Our Application Has Moved!
              </h3>
              <p className='text-white text-opacity-80 mb-4'>
                Taskbit is now available at a new location. You can continue
                using our software without interruption.
                <br />
                <span className='font-semibold'>
                  Please bookmark this if not bookmarked yet. Our previous URL
                  will not work soon!
                </span>
              </p>
            </div>

            <div className='bg-black bg-opacity-30 rounded-lg p-4 mb-4'>
              <p className='text-white text-opacity-60 text-sm mb-2 uppercase tracking-wide'>
                New Location
              </p>
              <a
                href='https://taskbit.insightedu.cloud/'
                target='_blank'
                rel='noopener noreferrer'
                className='text-white font-mono text-sm md:text-base break-all hover:text-gray-300 transition-colors'
              >
                https://taskbit.insightedu.cloud/
              </a>
            </div>

            <a
              href='https://taskbit.insightedu.cloud/'
              target='_blank'
              rel='noopener noreferrer'
              className='block w-full bg-white text-gray-900 font-semibold py-3 px-6 rounded-lg text-center hover:bg-gray-100 transition-all transform hover:scale-105 duration-200'
            >
              Visit New Location →
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className='text-white text-opacity-60 text-center mt-6 text-sm'>
          Thank you for your patience. Have a wonderful day! ✨
        </p>
      </div>
    </div>
  );
};

export default AppShiftedPage;

const PrologueMid2 = () => {
  return (
    <div className="container px-6 py-16 mx-auto">
      <div className="items-center lg:flex">
        <div className="w-full lg:w-1/2">
          <img
            className="w-full h-full lg:max-w-2xl"
            src="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80"
            alt="Catalogue-pana.svg"
          />
        </div>

        <div className="flex items-center justify-center w-full mt-6 lg:mt-0 lg:w-1/2">
          <div className="lg:max-w-lg">
            <h1 className="text-2xl font-semibold text-gray-800 uppercase  lg:text-3xl">
              Best Place To Choose Your Clothes
            </h1>
            <p className="mt-2 text-gray-600 ">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Porro
              beatae error laborum ab amet sunt recusandae? Reiciendis natus
              perspiciatis optio.
            </p>
            <button className="w-full px-3 py-2 mt-6 text-xs font-medium text-white uppercase transition-colors duration-200 transform bg-blue-600 rounded-md lg:w-auto hover:bg-blue-500 focus:outline-none focus:bg-blue-500">
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrologueMid2;

const Features = () => {
  const features = [
    {
      icon: 'bx-transfer',
      title: 'Fast Internet',
      description: 'Experience lightning-fast Internet with our advanced internet plans.'
    },
    {
      icon: 'bx-shield-quarter',
      title: 'Secure Payments',
      description: 'Your security is our priority. We use state-of-the-art encryption to protect your transactions.'
    },
    {
      icon: 'bx-support',
      title: '24/7 Support',
      description: 'Our dedicated support team is always ready to help you with any questions or concerns.'
    }
  ];

  return (
    <section className="py-20 bg-black/30 backdrop-blur-md">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">
          Our Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white/10 backdrop-blur-md p-8 rounded-lg transform hover:scale-105 transition-all duration-300 hover:bg-white/20"
            >
              <div className="w-16 h-16 bg-[#F7E16C] rounded-lg flex items-center justify-center mb-6">
                <i className={`bx ${feature.icon} text-3xl text-black`}></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-white/80">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 
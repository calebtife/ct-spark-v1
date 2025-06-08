import React from 'react';
import { motion } from 'framer-motion';
import { FaRocket, FaUsers, FaAward, FaClock } from 'react-icons/fa';
import HomeLayout from '../components/layouts/HomeLayout';
import CalebTife from '../assets/images/calebtife.jpeg'
import TeamBg from '../assets/images/teambg.jpg'

interface StatProps {
    value: string;
    label: string;
    icon: React.ReactNode;
}

interface ValueProps {
    title: string;
    description: string;
}

interface FounderProps {
    name: string;
    description: string;
    imageUrl: string;
    role: string;
}

const Value: React.FC<ValueProps> = ({ title, description }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        className="p-6 bg-white rounded-xl shadow-lg text-center"
    >
        <h3 className="text-xl font-bold mb-3 text-blue-600">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
);

const Stat: React.FC<StatProps> = ({ value, label, icon }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        className="text-center flex flex-col items-center"
    >
        <div className="text-blue-600 text-4xl mb-3">{icon}</div>
        <h2 className="text-6xl md:text-7xl font-extrabold text-gray-800 mb-2">{value}</h2>
        <p className="text-lg text-gray-600">{label}</p>
    </motion.div>
);

const Founder: React.FC<FounderProps> = ({ name, description, imageUrl, role }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        className="flex flex-col md:flex-row items-center gap-8 w-full max-w-4xl mx-auto"
    >
        <div className="flex-shrink-0 w-48 h-48 md:w-64 md:h-64 rounded-lg overflow-hidden shadow-lg">
            <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover"
            />
        </div>
        <div className="flex-1 text-center md:text-left">
            <h3 className="text-3xl font-bold text-gray-800 mt-2">{name}</h3>
            <p className="text-blue-600 font-medium text-lg mt-1">{role}</p>
            <p className="text-gray-700 leading-relaxed mt-4">{description}</p>
        </div>
    </motion.div>
);

const AboutUs: React.FC = () => {
    return (
        <HomeLayout
            title="About CT SPARK TECHNOLOGIES - Internet Service Provider"
            description="Learn about CT SPARK's mission to deliver cutting-edge technology solutions. Meet our leadership team and discover how we're transforming businesses through innovation."
        >
            <div className="bg-white min-h-screen pt-16 md:pt-0">
                {/* Hero Section */}
                <section className="relative bg-white text-gray-800 py-20 md:py-32 overflow-hidden">
                    <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="flex-1 text-center md:text-left"
                        >
                            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">ABOUT US</h1>
                            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-2xl mx-auto md:mx-0">
                                At CT Spark, we are dedicated to bringing fast, reliable internet connections to clients in even the most remote locations. With a focus on high-speed connectivity, we aim to bridge the digital divide by offering seamless, high-performance internet solutions where access is limited. Our team works tirelessly to ensure that every client, whether in rural areas, underserved communities, or isolated regions, experiences the power of fast, stable internet.
                            </p>
                            <a
                                href="mailto:info@ct-spark.com"
                                className="mt-8 inline-block px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors text-lg font-semibold"
                            >
                                Talk to Us <span className="ml-2">→</span>
                            </a>
                        </motion.div>
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="flex-1 w-full max-w-md md:max-w-none"
                        >
                            <img
                                src={TeamBg}
                                alt="Team collaborating"
                                className="w-full h-auto rounded-lg shadow-xl"
                            />
                        </motion.div>
                    </div>
                </section>

                {/* Commitment/Values Section */}
                <section className="max-w-6xl mx-auto py-16 px-4 text-gray-800">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        className="mb-16 text-center"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Commitment</h2>
                        <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
                            From home setups to business solutions, we provide tailored internet services that guarantee speed, reliability, and customer satisfaction. At CT Spark, we don't just provide internet; we provide the connection to the digital world that our clients need to thrive.
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        className="mb-20 grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        <Value
                            title="Transparency"
                            description="Prioritizing clear communication and honest advice to empower informed decisions."
                        />
                        <Value
                            title="Integrity"
                            description="Upholding the highest standards of ethics and honesty in all our interactions."
                        />
                        <Value
                            title="Professionalism"
                            description="Delivering expert, reliable, and high-quality service in every project."
                        />
                    </motion.div>
                </section>

                {/* Stats Section */}
                <section className="max-w-4xl mx-auto py-16 px-4 text-gray-800 border-y border-gray-200">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-12"
                    >
                        <Stat value="4+" label="Locations" icon={<FaRocket />} />
                        <Stat value="250+" label="Satisfied Clients" icon={<FaUsers />} />
                        <Stat value="2+" label="Years of Service" icon={<FaClock />} />
                    </motion.div>
                </section>

                {/* Founders Section */}
                <section className="max-w-6xl mx-auto py-16 px-4 text-gray-800">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        className="mb-12 text-center"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold">Meet Our Leadership</h2>
                    </motion.div>
                    <div className="space-y-12">
                        <Founder
                            name="Caleb Boluwatife Oluwafemi"
                            role="Founder & CTO"
                            description="Caleb is a visionary tech enthusiast with over two years of experience in front-end web application development. At CT SPARK, he plays a key role in advancing the company's mission to deliver innovative network solutions that make a real impact. Passionate about collaboration and continuous growth, Caleb is always open to new opportunities that expand his skills and push the boundaries of what's possible."
                            imageUrl={CalebTife}
                        />
                        {/* Add more founders here if needed */}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="max-w-6xl mx-auto py-16 px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        className="py-16 bg-blue-600 text-white rounded-xl shadow-lg"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to light your Spark?</h2>
                        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
                            Let's connect and discuss how CT SPARK can provide you with fast, reliable internet solutions.
                        </p>
                        <a
                            href="mailto:info@ct-spark.com"
                            className="inline-block px-10 py-5 bg-white text-blue-600 rounded-full hover:bg-gray-200 transition-colors text-lg font-semibold shadow-lg"
                        >
                            Get in Touch <span className="ml-2">→</span>
                        </a>
                    </motion.div>
                </section>
            </div>
        </HomeLayout>
    );
};

export default AboutUs;
import HomeLayout from '../components/layouts/HomeLayout';
import Hero from '../components/Hero';
import Features from '../components/Features';
import ReviewSection from '../components/ReviewSection';

const Home = () => {
    return (
        <HomeLayout>
            <Hero />
            <Features />
            <ReviewSection />
        </HomeLayout>
    );
};

export default Home; 
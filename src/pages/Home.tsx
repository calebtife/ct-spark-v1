import HomeLayout from '../components/layouts/HomeLayout';
import Hero from '../components/Hero';
import Features from '../components/Features';
import ReviewSection from '../components/ReviewSection';
import Plans from '../components/plans/Plans'

const Home = () => {
    return (
        <HomeLayout>
            <Hero />
            <Plans />
            <Features />
            <ReviewSection />
        </HomeLayout>
    );
};

export default Home; 
import React, { useEffect, useState, useRef } from 'react';
import { Film, Rocket, Ticket } from 'lucide-react';
import BlurCircle from '../components/BlurCircle'
import { assets } from '../assets/assets';

// Custom hook for visibility detection
const useOnScreen = (options) => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, options);

        if (ref.current) observer.observe(ref.current);
        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, [ref, options]);

    return [ref, isVisible];
};

// Animated counter
const AnimatedCounter = ({ target, duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const [ref, isVisible] = useOnScreen({ threshold: 0.5 });

    useEffect(() => {
        if (isVisible) {
            let start = 0;
            const end = parseInt(target);
            const incrementTime = (duration / end) * 1;
            const timer = setInterval(() => {
                start += 1;
                setCount(start);
                if (start === end) clearInterval(timer);
            }, incrementTime);
            return () => clearInterval(timer);
        }
    }, [target, duration, isVisible]);

    return <span ref={ref}>{count.toLocaleString()}</span>;
};

const AboutUs = () => {
    const [missionRef, missionVisible] = useOnScreen({ threshold: 0.2 });
    const [storyRef, storyVisible] = useOnScreen({ threshold: 0.2 });

    return (
        <div className="bg-dark text-primary-dull overflow-x-hidden">
            <BlurCircle top='-100px' left='-100px'/>
            <BlurCircle bottom='0px' right='0px'/>
            {/* Hero */}
            <div className="relative h-[60vh] md:h-[70vh] flex items-center justify-center text-center px-6">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 opacity-20"
                    style={{ backgroundImage: "url('https://placehold.co/1920x1080/000000/333333?text=.')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent z-10" />
                <div className="relative z-20 animate-fadeInUp">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
                        The Story of <span className="text-primary">QuickScreen</span>
                    </h1>
                    <p className="mt-4 md:mt-6 text-lg md:text-xl max-w-3xl mx-auto text-balance text-m text-gray-300 font-medium">
                        We're not just selling tickets; we're crafting the future of cinema experiences.
                    </p>
                </div>
            </div>

            {/* Our Mission */}
            <div ref={missionRef} className={`container mx-auto px-6 py-20 md:py-32 transition-all duration-1000 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary">Our Mission</h2>
                    <p className="mt-4 text-m text-gray-300 font-medium">To make every movie outing seamless, memorable, and magical.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-10">
                    {[{
                        Icon: Ticket,
                        title: 'Seamless Booking',
                        desc: 'From browsing to booking, enjoy a hassle-free journey in just a few clicks.'
                    }, {
                        Icon: Film,
                        title: 'Unforgettable Experiences',
                        desc: 'We connect you with the films you love, creating memories that last a lifetime.'
                    }, {
                        Icon: Rocket,
                        title: 'Innovation at Heart',
                        desc: 'Constantly evolving with the latest tech to enhance your cinematic adventure.'
                    }].map(({ Icon, title, desc }, idx) => (
                        <div key={idx} className="bg-dark p-8 rounded-2xl text-center flex flex-col items-center border border-primary-dull hover:-translate-y-2 transition-transform duration-300">
                            <Icon className="w-12 h-12 text-primary mb-4" />
                            <h3 className="text-xl font-semibold mb-2 text-primary">{title}</h3>
                            <p className='text-sm text-gray-300 font-medium'>{desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="bg-primary-dull/10 py-20">
                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
                    {[
                        { count: "15000", label: "Tickets Booked" },
                        { count: "50000", label: "Happy Movie-Goers" },
                        { count: "200", label: "Partner Theaters" }
                    ].map(({ count, label }, idx) => (
                        <div key={idx}>
                            <p className="text-4xl md:text-5xl font-bold text-primary"><AnimatedCounter target={count} />+</p>
                            <p className="mt-2 text-lg text-gray-300 font-medium">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Our Story */}
            <div ref={storyRef} className={`container mx-auto px-6 py-20 md:py-32 flex flex-col md:flex-row items-center gap-12 transition-all duration-1000 ${storyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="md:w-1/2">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">How It All Began</h2>
                    <p className="mb-4 text-m text-gray-300 font-medium">
                        QuickScreen was born from a simple idea: booking movie tickets should be as enjoyable as watching the movie itself.
                    </p>
                    <p className='text-m text-gray-300 font-medium'>
                        Today, we've grown into a trusted platform for thousands, but our core mission remains the same. We're still that group of friends, obsessed with film, dedicated to building the best possible experience for you.
                    </p>
                </div>
                <div className="md:w-1/2">
                    <img src={assets.screenImage} alt="Our Journey" className="rounded-2xl shadow-2xl w-full" />
                </div>
            </div>
        </div>
    );
};

export default AboutUs;

import React, { useRef, useEffect, useState } from 'react';
import BlurCircle from '../components/BlurCircle'

// Fade-in on scroll hook
const useOnScreen = (threshold = 0.2) => {
    const ref = useRef();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold }
        );

        if (ref.current) observer.observe(ref.current);
        return () => ref.current && observer.unobserve(ref.current);
    }, [ref, threshold]);

    return [ref, visible];
};

const PrivacyPolicy = () => {
    const [ref, visible] = useOnScreen();

    return (
        <div className="bg-dark text-primary-dull min-h-screen px-6 py-20 md:px-24">
            <BlurCircle top='-100px' left='-100px' />
            <BlurCircle bottom='0px' right='0px' />
            <div
                ref={ref}
                className={`max-w-4xl mx-auto transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            >
                <h1 className="text-4xl font-bold text-primary mb-6">Privacy Policy</h1>
                <p className="mb-8 text-lg text-sm text-gray-300 font-medium">
                    Your privacy is important to us. This policy outlines how QuickScreen collects, uses, and protects your personal data.
                </p>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold text-primary mb-2">1. Information We Collect</h2>
                    <p className='text-sm text-gray-300 font-medium'>
                        We may collect information such as your name, email, phone number, and payment details when you use our services. Additionally, we may collect usage data to improve your experience.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold text-primary mb-2">2. How We Use Your Information</h2>
                    <ul className="list-disc pl-6 space-y-2 text-sm text-gray-300 font-medium">
                        <li>To process bookings and payments securely</li>
                        <li>To provide customer support and updates</li>
                        <li>To analyze usage and improve our platform</li>
                        <li>To comply with legal obligations</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold text-primary mb-2">3. Sharing & Disclosure</h2>
                    <p className='text-sm text-gray-300 font-medium'>
                        We do not sell your personal data. We may share data with trusted partners to operate our service, such as payment processors and analytics providers, under strict confidentiality.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold text-primary mb-2">4. Data Security</h2>
                    <p className='text-sm text-gray-300 font-medium'>
                        We implement robust security measures to protect your data from unauthorized access. However, no method of transmission over the internet is 100% secure.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold text-primary mb-2">5. Your Rights</h2>
                    <ul className="list-disc pl-6 space-y-2 text-sm text-gray-300 font-medium" >
                        <li>Access the personal data we hold about you</li>
                        <li>Request correction or deletion of your data</li>
                        <li>Withdraw consent at any time</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold text-primary mb-2">6. Changes to This Policy</h2>
                    <p className='text-sm text-gray-300 font-medium'>
                        We may update this Privacy Policy from time to time. When we do, we will revise the "Last Updated" date below.
                    </p>
                </section>

                <section>
                    <p className="text-sm text-primary-dull italic">Last Updated: July 26, 2025</p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
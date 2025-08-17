import React, { useState } from 'react';
import BlurCircle from './BlurCircle';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const DateSelect = ({ dateTime, id }) => {
    const navigate = useNavigate();

    // Define the 'dates' array from the keys of the 'dateTime' object.
    const dates = Object.keys(dateTime);

    // Initialize 'selected' state with the first date for better user experience.
    const [selected, setSelected] = useState('');

    // Add logic for the previous/next arrow buttons.
    const currentIndex = dates.indexOf(selected);
    const handlePrev = () => {
        if (currentIndex > 0) {
            setSelected(dates[currentIndex - 1]);
        }
    };
    const handleNext = () => {
        if (currentIndex < dates.length - 1) {
            setSelected(dates[currentIndex + 1]);
        }
    };

    const onBookHandler = () => {
        if (!selected) {
            return toast('Please Select a Date');
        }
        navigate(`/movies/${id}/${selected}`);
        // Use 'window.scrollTo' which is the correct way to call it.
        window.scrollTo(0, 0);
    };

    return (
        <div id='dateSelect' className='pt-30'>
            <div className='flex flex-col md:flex-row items-center justify-between gap-6 relative p-8 bg-primary/10 border border-primary/20 rounded-lg'>
                <BlurCircle top='-100px' left='-100px' />
                <BlurCircle top='100px' right='0px' />

                <div className='flex-grow'>
                    <p className='font-semibold text-base text-center md:text-lg md:text-left'>Choose Date</p>
                    <div className='flex items-center gap-4 text-sm mt-5'>
                        {/* Attach the 'handlePrev' function */}
                        <button onClick={handlePrev} className='p-2 rounded-full hover:bg-primary/20 transition-colors'>
                            <ChevronLeftIcon width={24} />
                        </button>

                        <div className='flex items-center gap-4 overflow-x-auto pb-2' style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {/* This .map() function will now work correctly */}
                            {dates.map((date) => (
                                <button
                                    key={date}
                                    onClick={() => setSelected(date)}
                                    className={`flex flex-col items-center justify-center h-14 w-14 rounded-lg cursor-pointer transition-colors flex-shrink-0 
                                        ${selected === date ? 'bg-primary text-white' : 'border border-primary/70'}`
                                    }
                                >
                                    <span>{new Date(date).getDate()}</span>
                                    <span className='font-semibold'>{new Date(date).toLocaleDateString("en-US", { month: "short" })}</span>
                                </button>
                            ))}
                        </div>

                        {/* Attach the 'handleNext' function */}
                        <button onClick={handleNext} className='p-2 rounded-full hover:bg-primary/20 transition-colors'>
                            <ChevronRightIcon width={24} />
                        </button>
                    </div>
                </div>

                <button className='bg-primary text-white px-10 py-3 rounded-lg hover:bg-primary/90 transition-all cursor-pointer w-full md:w-auto' onClick={onBookHandler}>
                    Book Now
                </button>
            </div>
        </div>
    );
};

export default DateSelect;
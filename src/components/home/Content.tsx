import React from 'react';
import products from '../images/products.png';
import orders from '../images/orders.png';
import sales from '../images/sales.png';
import stocks from '../images/stocks.png';

const Content: React.FC = () => {
const offers = [
    {
        title: 'Product Adjusments',
        description:
            'When selling a product, you need to make a few adjusments, our website can help you with that. From namings, pricing, and stock, we got it all.',
        icon: products,
        },
        {
        title: 'Order Details',
        description:
            'With our order details feature, you can easily track and manage your orders. From supplier names to the products you have purchased',
        icon: orders,
        },
        {
        title: 'Sales Recap',
        description:
            'When it comes to sales, you need to have a recap of what you have sold. This feature gives you the details of what product sells the most per month.',
        icon: sales,
        },
        {
        title: 'Stock Counter',
        description:
            'The stock counter feature helps you in organizing your stock. You can easily see what products are running low and need to be restocked.',
        icon: stocks,
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-yellow-100 pt-5">
        {/* Page Title */}
        <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4 mt-25">
            What We Offer
            </h1>
            <p className="text-lg text-gray-600">
            Explore our range of services designed to meet your needs.
            </p>
        </div>

        {/* Offer Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {offers.map((offer, index) => (
        <div
            key={index}
            className="bg-white shadow-lg rounded-xl p-6 transform transition duration-500 ease-in-out hover:-translate-y-2 hover:shadow-2xl"
        >
            <div className="flex items-center gap-2 mb-2">
            <img
                src={offer.icon}
                alt={`${offer.title} icon`}
                className="w-6 h-6 object-contain"
            />
            <h2 className="text-xl font-bold text-[#FC8500]">{offer.title}</h2>
            </div>
            <p className="text-gray-600">{offer.description}</p>
        </div>
        ))}
        </div>
        <div className="flex justify-center mt-12">
            <button className="bg-[#FFB701] text-black font-bold py-3 px-6 rounded-full hover:bg-[#FC8500] transition duration-300">
                Contact Us!
            </button>
        </div>
        </div>
    );
};

export default Content;

import React from 'react';
import { X, Heart, MessageCircle, Share2, Users, Star, Plus } from 'lucide-react';
import { IMAGES } from '../imageRegistry';

interface ConnectFeedProps {
    isOpen: boolean;
    onClose: () => void;
}

const ConnectFeed: React.FC<ConnectFeedProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const posts = [
        {
            id: 1,
            user: 'Helen Berhe',
            avatar: IMAGES.post_1_avatar,
            image: IMAGES.post_1_image,
            content: 'Best pizza in Bole! 🍕 The crust at Effoi never disappoints. Highly recommend the "Shiro Pizza" for a twist!',
            likes: 124,
            comments: 18,
            location: 'Effoi Pizza, Bole'
        },
        {
            id: 2,
            user: 'Dawit Tadesse',
            avatar: IMAGES.post_2_avatar,
            image: IMAGES.post_2_image,
            content: 'Just tried the new Afta Mart delivery. Got my groceries in 20 mins! 🚀 #AftaDelivery #AddisLife',
            likes: 89,
            comments: 5,
            location: 'Afta Mart'
        },
        {
            id: 3,
            user: 'Sipping Addis',
            avatar: IMAGES.post_3_avatar,
            image: IMAGES.post_3_image,
            content: 'Sunday coffee vibes at Tomoca. Who is joining the coffee crawl next weekend? ☕',
            likes: 245,
            comments: 42,
            location: 'Tomoca Coffee'
        }
    ];

    const groups = [
        { name: 'Addis Foodies 🍔', members: '12k' },
        { name: 'Vegan Ethiopia 🥬', members: '5.4k' },
        { name: 'Tech & Chill 💻', members: '8.1k' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-gray-50 w-full max-w-2xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-200 flex flex-col">

                {/* Header */}
                <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-20">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="text-[#DA121A]" /> Afta Connect
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col md:flex-row h-full">

                        {/* Feed Area */}
                        <div className="flex-1 p-4 space-y-6">
                            {/* Post Input Mock */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                    <img src="https://ui-avatars.com/api/?name=User&background=random" alt="Me" />
                                </div>
                                <div className="flex-1">
                                    <input type="text" placeholder="Share your experience..." className="w-full bg-gray-50 rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300" />
                                </div>
                            </div>

                            {posts.map(post => (
                                <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img src={post.avatar} alt={post.user} className="w-10 h-10 rounded-full object-cover" />
                                            <div>
                                                <h4 className="font-bold text-sm text-gray-900">{post.user}</h4>
                                                <p className="text-xs text-gray-500">{post.location}</p>
                                            </div>
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600">•••</button>
                                    </div>

                                    {post.image && (
                                        <div className="h-64 overflow-hidden">
                                            <img src={post.image} alt="Content" className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    <div className="p-4">
                                        <p className="text-gray-800 text-sm mb-3">{post.content}</p>

                                        <div className="flex items-center gap-6 text-gray-500">
                                            <button className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                                                <Heart size={18} /> <span className="text-xs font-bold">{post.likes}</span>
                                            </button>
                                            <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
                                                <MessageCircle size={18} /> <span className="text-xs font-bold">{post.comments}</span>
                                            </button>
                                            <button className="flex items-center gap-1.5 hover:text-green-500 transition-colors">
                                                <Share2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Sidebar (Community Groups) */}
                        <div className="hidden md:block w-72 p-4 bg-white border-l border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Trending Communities</h3>
                            <div className="space-y-4">
                                {groups.map((group, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-800">{group.name}</h4>
                                            <p className="text-xs text-gray-500">{group.members} members</p>
                                        </div>
                                        <button className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-[#E6F0EA] hover:text-[#00843D]">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 p-4 bg-gradient-to-br from-[#00843D] to-[#006B31] rounded-xl text-white text-center">
                                <Star className="mx-auto mb-2 text-[#FCDD09] fill-current" />
                                <h4 className="font-bold mb-1">Become a Top Reviewer</h4>
                                <p className="text-xs opacity-90 mb-3">Get free meals by sharing helpful reviews!</p>
                                <button className="bg-white text-[#00843D] text-xs font-bold px-4 py-2 rounded-full w-full">Learn More</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConnectFeed;

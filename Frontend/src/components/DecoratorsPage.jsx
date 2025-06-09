import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Cards2 from './Cards2';
import './DecoratorsPage.css'; // Assuming you have this for styling

function DecoratorsPage() {
  const [decorators, setDecorators] = useState([]);
  const [recommendedDecorators, setRecommendedDecorators] = useState([]);
  const { register, handleSubmit } = useForm();

  // Fetch all decorators
  useEffect(() => {
    const getDecorators = async () => {
      try {
        const res = await axios.get('http://localhost:8000/decorators');
        console.log(res.data);
        setDecorators(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    getDecorators();
  }, []);

  // Fetch recommendations from backend
  const onSubmitPreferences = async (data) => {
    try {
      const res = await axios.post('http://localhost:8000/decorators/recommendations', {
        budget: parseFloat(data.budget), // Ensure budget is a number
        category: data.category || '', // Send empty string if no category selected
      });
      setRecommendedDecorators(res.data);
    } catch (error) {
      console.log('Error fetching recommendations:', error);
    }
  };

  return (
    <div className="max-w-screen-2xl mx-[120px] px-3 border-3 border-black">
      <div>
        <h1 className="text-black text-2xl">Find Your Perfect Style</h1>
      </div>

      {/* Preferences Form */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Get Personalized Decorator Recommendations</h2>
        <form
          onSubmit={handleSubmit(onSubmitPreferences)}
          className="flex flex-col gap-4 mt-4 max-w-md"
        >
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Max Budget ($)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter your budget"
              {...register('budget', { required: true, min: 0 })}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Style Preference
            </label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              {...register('category')}
            >
              <option value="">Any</option>
              <option value="Modern">Modern</option>
              <option value="Traditional">Traditional</option>
              <option value="Bohemian">Bohemian</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
          >
            Get Recommendations
          </button>
        </form>
      </div>

      {/* Recommended Decorators Section */}
      {recommendedDecorators.length > 0 && (
        <div className="recommendation-section mt-12">
          <h2 className="text-xl font-semibold">Recommended for You</h2>
          <div className="mt-6 grid gap-14 grid-cols-3">
            {recommendedDecorators.map((item) => (
              <Cards2 key={item._id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* All Decorators Section */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold">All Decorators</h2>
        <div className="mt-6 grid gap-14 grid-cols-3">
          {decorators.map((item) => (
            <Cards2 key={item._id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default DecoratorsPage;
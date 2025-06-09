import React from 'react';
import { Link } from "react-router-dom";

function Cards({ item }) {
  return (
    <div className="card bg-base-100 w-96 shadow-xl p-26 hover:scale-105 duration-200">
      <figure>
        <img
          src={item.image}
          alt={item.name} 
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">
          {item.name} 
          <div className="badge badge-secondary">NEW</div>
        </h2>
        <p>{item.description}</p>
        <div className="card-actions flex justify-between">
          <div className="badge badge-outline hover:bg-pink-500 duration-500 hover:translate-x-5 duration-500 hover:text-white duration-500">{item.category}</div>
          <div className="badge badge-outline hover:bg-pink-500 duration-500 hover:translate-x-5 duration-500 hover:text-white duration-500">${item.price}</div> 
        </div>
      
        <Link to={`/hotels/${item._id}`} className="btn btn-primary mt-4">
    View Details
</Link>

      </div>
    </div>
  );
}

export default Cards;

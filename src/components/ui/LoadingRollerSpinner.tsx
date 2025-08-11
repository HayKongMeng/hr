'use client';
import React from 'react'

const LoadingRollerSpinner = () => {
    return (
        <div className="spinner">
            <div className="lds-roller">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>

            <div>Loading...</div>
        </div>
    )
}

export default LoadingRollerSpinner;



import React from 'react';
import { Link } from 'react-router-dom';

const steps = [
  { path: '/cart', label: 'Cart' },
  { path: '/place-order', label: 'Delivery & Payment' },
];

/**
 * Progress indicator for checkout: Cart → Delivery & Payment.
 * currentStep: 1 = Cart, 2 = Place order
 */
function CheckoutSteps({ currentStep }) {
  return (
    <nav aria-label="Checkout progress" className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isPast = currentStep > stepNumber;
        return (
          <React.Fragment key={step.path}>
            {index > 0 && (
              <span
                className={`w-6 sm:w-10 h-0.5 flex-shrink-0 ${
                  isPast ? 'bg-black' : 'bg-gray-300'
                }`}
                aria-hidden
              />
            )}
            {isActive ? (
              <span
                className="flex items-center gap-1.5 text-sm font-medium text-black"
                aria-current="step"
              >
              <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-black bg-black text-white text-xs">
                {stepNumber}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
              </span>
            ) : isPast ? (
              <Link
                to={step.path}
                className="flex items-center gap-1.5 text-sm font-medium text-black hover:underline no-underline"
              >
              <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-black bg-black text-white text-xs">
                ✓
              </span>
              <span className="hidden sm:inline">{step.label}</span>
              </Link>
            ) : (
              <span className="flex items-center gap-1.5 text-sm font-medium text-gray-400">
              <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-gray-300 text-xs">
                {stepNumber}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default CheckoutSteps;

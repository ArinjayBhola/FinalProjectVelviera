import React from 'react';
import Title from './Title';
import { HiOutlineArrowPath, HiOutlineCheckBadge, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import Card from '../components/ui/Card';

function OurPolicy() {
  const policies = [
    {
      icon: HiOutlineArrowPath,
      title: "Easy Exchange Policy",
      description: "Exchange Made Easy – Quick, Simple, and Customer-Friendly Process.",
    },
    {
      icon: HiOutlineCheckBadge,
      title: "7 Days Return Policy",
      description: "Shop with Confidence – 7 Days Easy Return Guarantee.",
    },
    {
      icon: HiOutlineChatBubbleLeftRight,
      title: "Best Customer Support",
      description: "Trusted Customer Support – Your Satisfaction Is Our Priority.",
    },
  ];

  return (
    <div className="w-full py-16 md:py-24 flex flex-col items-center gap-16">
      <div className="text-center flex flex-col gap-4 max-w-2xl">
        <Title text1="OUR" text2="POLICY" />
        <p className="text-[var(--text-muted)] text-base md:text-lg">
          Customer-Friendly Policies – Committed to Your Satisfaction and Safety.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {policies.map((policy, index) => (
          <Card key={index} className="flex flex-col items-center text-center gap-6 group hover:border-[var(--brand-primary)] transition-all duration-300 py-10">
            <div className="w-20 h-20 rounded-full bg-[var(--background-subtle)] flex items-center justify-center text-[var(--brand-primary)] group-hover:bg-[var(--brand-primary)] group-hover:text-[var(--background-base)] transition-all duration-300 shadow-soft">
              <policy.icon className="w-10 h-10" />
            </div>
            <div className="flex flex-col gap-3 px-4">
              <h3 className="font-bold text-xl tracking-tight text-[var(--text-base)]">
                {policy.title}
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                {policy.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default OurPolicy;

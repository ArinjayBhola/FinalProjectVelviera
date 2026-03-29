import React from "react";
import Title from "../component/Title";
import about from "../assets/about.jpg";
import NewLetterBox from "../component/NewLetterBox";
import Card from "../components/ui/Card";

function About() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col gap-16 md:gap-24">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="w-full lg:w-1/2">
          <div className="relative flex aspect-[4/3] rounded-soft overflow-hidden border border-[var(--border-base)] cursor-default transition-all duration-500 hover:ring-4 hover:ring-[var(--brand-secondary)] hover:ring-offset-4 hover:ring-offset-[var(--background-base)] shadow-xl group">
            <img
              src={about}
              alt="About Velviera"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <Title text1="ABOUT" text2="US" />
          <div className="flex flex-col gap-4 text-[var(--text-muted)] leading-relaxed">
            <p>
              Velviera was born from a vision of smart, seamless shopping—created to deliver quality products, 
              trending styles, and everyday essentials in one place. We believe that professional quality 
              should be accessible to everyone, and we strive to bring you the best from around the world.
            </p>
            <p>
              With reliable service, fast delivery, and exceptional value, Velviera makes your online 
              shopping experience simple, satisfying, and stress-free. We are not just a store; we are 
              a community of modern shoppers who value style and convenience.
            </p>
            <h3 className="text-xl font-bold text-[var(--text-base)] mt-4">Our Mission</h3>
            <p>
              Our mission is to redefine online shopping by delivering quality, affordability, and convenience. 
              Velviera connects customers with trusted products and brands, offering a seamless, 
              customer-focused experience that saves time, adds value, and fits every lifestyle and need.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="flex flex-col gap-12">
        <div className="text-center">
          <Title text1="WHY" text2="CHOOSE US" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
          <Card className="flex flex-col gap-4 group hover:border-[var(--brand-primary)] transition-colors">
            <div className="w-12 h-12 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center text-[var(--brand-primary)] font-bold text-xl">01</div>
            <h4 className="text-lg font-bold">Quality Assurance</h4>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              We guarantee quality through strict checks, reliable sourcing, and a commitment to customer 
              satisfaction that never wavers. Every product is hand-picked for excellence.
            </p>
          </Card>
          <Card className="flex flex-col gap-4 group hover:border-[var(--brand-primary)] transition-colors">
            <div className="w-12 h-12 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center text-[var(--brand-primary)] font-bold text-xl">02</div>
            <h4 className="text-lg font-bold">Convenience</h4>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Shop easily with fast delivery, simple navigation, secure checkout, and everything you 
              need in one place, optimized for your busy lifestyle.
            </p>
          </Card>
          <Card className="flex flex-col gap-4 group hover:border-[var(--brand-primary)] transition-colors">
            <div className="w-12 h-12 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center text-[var(--brand-primary)] font-bold text-xl">03</div>
            <h4 className="text-lg font-bold">Customer Service</h4>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Our dedicated support team ensures quick responses, helpful solutions, and a smooth 
              shopping experience every time you interact with our brand.
            </p>
          </Card>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <NewLetterBox />
      </div>
    </div>
  );
}

export default About;

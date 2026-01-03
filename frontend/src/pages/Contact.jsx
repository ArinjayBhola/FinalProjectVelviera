import React from "react";
import Title from "../component/Title";
import contact from "../assets/contact.jpg";
import NewLetterBox from "../component/NewLetterBox";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

function Contact() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col gap-16 md:gap-24">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="w-full lg:w-1/2">
          <div className="relative aspect-[4/3] rounded-soft overflow-hidden border border-[var(--border-base)] shadow-lg">
            <img
              src={contact}
              alt="Contact Velviera"
              className="w-full h-full object-cover transition-all duration-700"
            />
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex flex-col gap-8">
          <Title text1="CONTACT" text2="US" />
          
          <div className="flex flex-col gap-10">
            {/* Store Info */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-bold uppercase tracking-widest text-[var(--brand-primary)]">Our Store</h3>
              <div className="flex flex-col gap-2 text-[var(--text-muted)]">
                <p className="font-medium text-[var(--text-base)]">12345 Random Station</p>
                <p>Random City, State, India</p>
                <div className="mt-2 flex flex-col gap-1">
                  <p><span className="font-medium text-[var(--text-base)]">Tel:</span> +91-9876543210</p>
                  <p><span className="font-medium text-[var(--text-base)]">Email:</span> admin@velviera.com</p>
                </div>
              </div>
            </div>

            {/* Careers */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-bold uppercase tracking-widest text-[var(--brand-primary)]">Careers at Velviera</h3>
              <p className="text-[var(--text-muted)]">
                We are always looking for talented individuals to join our growing team. 
                Learn more about our culture and current job openings.
              </p>
              <Button variant="secondary" className="w-fit" size="lg">
                Explore Jobs
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <NewLetterBox />
      </div>
    </div>
  );
}

export default Contact;

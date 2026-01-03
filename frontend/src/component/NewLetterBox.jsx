import Button from '../components/ui/Button';

function NewLetterBox() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Implementation for subscription
  };

  return (
    <div className="w-full py-16 md:py-24 bg-[var(--background-subtle)] border border-[var(--border-base)] rounded-soft overflow-hidden relative">
      <div className="flex flex-col items-center gap-6 px-6 text-center max-w-2xl mx-auto relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--brand-primary)]">
          Subscribe now & get 20% off
        </h2>
        <p className="text-[var(--text-muted)] text-base md:text-lg">
          Subscribe now and enjoy exclusive savings, special deals, and early access to new collections.
        </p>
        
        <form 
          onSubmit={handleSubmit} 
          className="w-full flex flex-col sm:flex-row items-center gap-4 mt-4"
        >
          <input 
            type="email" 
            placeholder="Enter Your Email" 
            className="flex-1 w-full px-6 py-4 bg-[var(--background-base)] border border-[var(--border-base)] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)] transition-all"
            required 
          />
          <Button 
            type="submit" 
            className="w-full sm:w-auto px-10 py-4 h-auto rounded-full text-base font-bold uppercase tracking-widest"
          >
            Subscribe
          </Button>
        </form>
      </div>
      
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand-primary)]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--brand-primary)]/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
    </div>
  );
}

export default NewLetterBox;

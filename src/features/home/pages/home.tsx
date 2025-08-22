

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Hero Title */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                <span className="text-primary block">Farmers Loan Facilitator</span>
              </h1>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        <p className="font-semibold mb-2 text-foreground">Disclaimer</p>
        <p className="max-w-3xl mx-auto">
          KidneyScan Analyzer is an AI-powered tool for informational purposes
          only and is not a substitute for professional medical advice,
          diagnosis, or treatment. Always consult with a qualified healthcare
          provider for any medical concerns.
        </p>
        <p className="mt-4">
          © {currentYear} KidneyScan Analyzer. Created by Sathwik Pamu.
        </p>
      </div>
    </footer>
  );
}

import Navbar from "./components/navbar";
import Hero from "./components/hero";
import Projects from "./components/projects";
import About from "./components/about";
import Contact from "./components/contact";
import { profile } from "../lib/data";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Projects />
        <About />
        <Contact />
      </main>
      <footer className="border-t border-line py-8 text-sm text-muted">
        <div className="mx-auto max-w-6xl px-6">
          {new Date().getFullYear()} {profile.name}
        </div>
      </footer>
    </>
  );
}

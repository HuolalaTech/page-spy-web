import { Banner } from './components/Banner';
import { Introduction } from './components/Introduction';
import { Footer } from './components/Footer';

export const Home = () => {
  return (
    <div className="home-page">
      <Banner />
      <Introduction />
      <Footer />
    </div>
  );
};

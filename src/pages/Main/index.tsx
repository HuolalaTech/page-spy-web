import { Banner } from './components/Banner';
import { Introduction } from './components/Introduction';
import { Footer } from './components/Footer';

export const Main = () => {
  return (
    <div className="home-page">
      <Banner />
      <Introduction />
      <Footer />
    </div>
  );
};

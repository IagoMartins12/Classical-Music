'use client';

import SectionTitle from '../Utils/SectionTitle';

import ListComposers from '../Lists/ListComposers';
import { pageComposersInterface } from '../PopularComposers';

const EssentialComposers: React.FC<pageComposersInterface> = ({
  composersData,
}) => {
  return (
    <section className="section-wrap ">
      <SectionTitle title="Compositores essenciais" />
      <ListComposers composers={composersData} />
    </section>
  );
};

export default EssentialComposers;

// import { useState } from 'react';
// import SearchBar from '../SearchBar';
// import ComposerList from '../ComposerList';
// import WorkList from '../WorkList';

// interface SearchComponentProps {
//   teste: string;
// }
// const SearchComponent: React.FC<SearchComponentProps> = () => {
//   const [composers, setComposers] = useState([]);
//   const [works, setWorks] = useState([]);

//   const handleSearch = async (term: string) => {
//     const res = await fetch(`/api/composers?q=${term}`);
//     const data = await res.json();

//     setComposers(data);
//     setWorks([]);
//   };

//   const handleSelectComposer = async (id: number) => {
//     const res = await fetch(`/api/pieces?id=${id}`);
//     const data = await res.json();

//     setWorks(data.works);
//   };

//   return (
//     <div>
//       <SearchBar onSearch={handleSearch} />
//       {composers.length > 0 && (
//         <ComposerList composers={composers} onSelect={handleSelectComposer} />
//       )}
//       {works.length > 0 && <WorkList works={works} />}
//     </div>
//   );
// };

// export default SearchComponent;

import type { InstrumentChapter } from './types';

export const INSTRUMENTS_EN: InstrumentChapter[] = [
  {
    key: 'piano',
    name: 'Piano',
    when: 'Florence, around 1700',
    lede: 'The piano was invented to fix one thing the harpsichord could not do: play louder or softer depending on the touch. In little more than a century it became the instrument of home, study and concert hall.',
    howItWorks:
      'Each key throws a felt-covered hammer at the string, and the hammer falls straight back so the string can ring. The harder the touch, the faster the hammer and the louder the sound. When the key is released, a damper lands on the string and stops it. The right pedal lifts every damper at once, so notes keep sounding. In the treble each note has three strings tuned together; in the bass, one or two thick strings wound with copper.',
    story: [
      'Bartolomeo Cristofori looked after the Medici family’s instruments in Florence, and around 1700 he built a harpsichord with hammers instead of quills. He called it gravicembalo col piano e forte, a harpsichord with soft and loud. The name shrank to pianoforte, then to piano. The key to the invention was the escapement, which lets the hammer drop back the instant it strikes.',
      'In the eighteenth century, German and Austrian builders improved the idea. Mozart played light, clear Viennese pianos. Beethoven wanted more volume and deeper bass, and heavier English pianos reached him. In 1821, in Paris, Sébastien Érard patented the double escapement, which lets a note be repeated very fast, the basis of Liszt’s virtuoso technique.',
      'The next leap came with iron. Cast-iron frames held strings at far higher tension for a fuller sound, and in 1859 Steinway in New York crossed the bass strings over the middle ones. By the end of the nineteenth century the piano had the shape and the 88 keys it has today.',
    ],
    timeline: [
      {
        year: 'c. 1700',
        text: 'Cristofori builds the first piano in Florence.',
      },
      {
        year: '1780s',
        text: 'The Viennese pianos of Stein and Walter that Mozart used.',
      },
      {
        year: '1821',
        text: 'Érard patents the double escapement and fast repeated notes.',
      },
      {
        year: '1859',
        text: 'Steinway crosses the strings over an iron frame.',
      },
      { year: 'late 19th c.', text: 'Eighty-eight keys become standard.' },
    ],
    repertoire:
      'Almost every great composer wrote for the piano. Mozart left concertos in which he was the soloist. Beethoven’s 32 sonatas span his whole life. Chopin wrote almost only for the instrument, Liszt pushed its technique to the limit, and Debussy and Ravel explored its colours. In the twentieth century, Rachmaninoff, Prokofiev and Villa-Lobos carried the tradition on.',
    listenFirst: [
      {
        composer: 'Wolfgang Amadeus Mozart',
        work: 'Sonata in C major, K. 545',
        note: 'Written “for beginners,” clear and cheerful. Many people learn to play with it.',
      },
      {
        composer: 'Frédéric Chopin',
        work: 'Ballade No. 1, Op. 23',
        note: 'Ten minutes of drama: it begins in a whisper and ends in a storm.',
      },
      {
        composer: 'Claude Debussy',
        work: 'Clair de lune',
        note: 'The pedal lets the notes blend like light on water.',
      },
      {
        composer: 'Sergei Rachmaninoff',
        work: 'Piano Concerto No. 2',
        note: 'It opens with chords like tolling bells and grows into huge melodies.',
      },
    ],
    didYouKnow: [
      'The oldest surviving Cristofori piano, from 1720, is at the Metropolitan Museum in New York and can still be played.',
      'Added together, the strings of a grand piano pull on its frame with a force of about twenty tonnes.',
    ],
  },
  {
    key: 'harpsichord',
    name: 'Harpsichord',
    when: 'Europe, 14th and 15th centuries',
    lede: 'The harpsichord was the keyboard of the Renaissance and the Baroque. Its bright, precise sound held up the basso continuo of almost all the music of the time, and it returned to the stage in the twentieth century.',
    howItWorks:
      'When a key goes down, a wooden piece called a jack rises and a small plectrum, once made from a bird’s quill, plucks the string. The force of the finger barely changes the volume. To vary the sound, the player switches stops, bringing in another row of strings, or moves to a second keyboard. Expression comes from articulation, timing and ornaments.',
    story: [
      'The first written mention of a clavicembalum dates from 1397, in Padua. Over the following centuries each region developed its own way of building. In Antwerp, the Ruckers family made harpsichords so admired that, a hundred years later, they were rebuilt rather than replaced.',
      'In the Baroque the harpsichord was everywhere: it played chords in the continuo of operas, cantatas and sonatas and had a vast solo repertoire. In France, François Couperin and Jean-Philippe Rameau wrote pieces with poetic titles. Domenico Scarlatti composed hundreds of short sonatas for the courts of Lisbon and Madrid, and Bach published the Goldberg Variations for a two-manual harpsichord.',
      'With the rise of the piano, the harpsichord nearly vanished in the nineteenth century. It was brought back by the Polish player Wanda Landowska, who performed on an instrument built by Pleyel and commissioned new works, such as the concertos of Manuel de Falla and Francis Poulenc. Today early-music ensembles play copies of historical harpsichords.',
    ],
    timeline: [
      { year: '1397', text: 'First written mention, in Padua.' },
      {
        year: '16th–17th c.',
        text: 'The Ruckers family in Antwerp defines the Flemish harpsichord.',
      },
      { year: '1741', text: 'Bach publishes the Goldberg Variations.' },
      {
        year: '1912',
        text: 'Wanda Landowska brings it back to the concert hall.',
      },
    ],
    repertoire:
      'Bach, Couperin, Rameau, Scarlatti and Handel form the core. In the continuo, the harpsichord is in almost all Baroque music. In the twentieth century, Falla, Poulenc and György Ligeti wrote for it.',
    listenFirst: [
      {
        composer: 'Johann Sebastian Bach',
        work: 'Goldberg Variations: Aria',
        note: 'A calm sarabande that gives rise to thirty variations.',
      },
      {
        composer: 'Domenico Scarlatti',
        work: 'Sonata in D minor, K. 141',
        note: 'Rapid repeated notes with the flavour of a Spanish guitar.',
      },
      {
        composer: 'Jean-Philippe Rameau',
        work: 'La Poule',
        note: 'A hen’s clucking turned into music.',
      },
      {
        composer: 'François Couperin',
        work: 'Les Barricades mystérieuses',
        note: 'Overlapping notes that weave a hypnotic texture.',
      },
    ],
    didYouKnow: [
      'A French harpsichord could have landscapes painted on its lid by artists of the day. Some are worth more for the painting than for the instrument.',
      'Ligeti wrote Continuum, in 1968, for harpsichord played so fast that the notes merge into a single continuous sound.',
    ],
  },
  {
    key: 'organ',
    name: 'Organ',
    when: 'Alexandria, 3rd century BC',
    lede: 'The organ is the oldest keyboard instrument and the largest of all. With air flowing through pipes, it can whisper or make a whole cathedral tremble.',
    howItWorks:
      'A bellows, now electric, keeps air under pressure. Each key opens the way for air into metal or wooden pipes, and each pipe plays a single note with a single tone colour. Stops, drawn by knobs beside the keyboards, choose which ranks of pipes sound: flutes, reeds, loud or delicate voices. The organist plays with the hands on two or more keyboards, the manuals, and with the feet on a pedalboard.',
    story: [
      'In the third century BC, the Greek engineer Ctesibius of Alexandria invented the hydraulis, an organ in which water regulated the air pressure. It sounded in Roman arenas and feasts. In 757 the Byzantine emperor sent an organ as a gift to the Frankish king Pepin, and from then on it gradually entered the churches of Western Europe.',
      'In the Middle Ages and the Renaissance, organs grew along with the cathedrals. In the Baroque, northern Germany had the most famous builders, such as Arp Schnitger, and organists such as Dieterich Buxtehude and Johann Sebastian Bach wrote preludes, fugues and chorales that are still at the heart of the repertoire.',
      'In the nineteenth century, the French builder Aristide Cavaillé-Coll made organs able to imitate an orchestra, and Charles-Marie Widor and César Franck wrote symphonies for solo organ. In the twentieth century, Olivier Messiaen used the instrument to paint colours and birdsong.',
    ],
    timeline: [
      {
        year: '3rd c. BC',
        text: 'Ctesibius invents the hydraulis in Alexandria.',
      },
      {
        year: '757',
        text: 'Byzantium gives the Frankish king Pepin an organ.',
      },
      {
        year: '17th–18th c.',
        text: 'The great Baroque organs of northern Germany.',
      },
      { year: '19th c.', text: 'Cavaillé-Coll’s symphonic organs in France.' },
    ],
    repertoire:
      'Bach is the centre, with preludes and fugues, toccatas and chorales. Before him, Frescobaldi and Buxtehude; after him, Mendelssohn, Franck, Widor, Vierne and Messiaen. Saint-Saëns joined organ and orchestra in his Third Symphony.',
    listenFirst: [
      {
        composer: 'Johann Sebastian Bach',
        work: 'Toccata and Fugue in D minor, BWV 565',
        note: 'The most famous opening for organ. Whether it is really by Bach is still debated.',
      },
      {
        composer: 'Charles-Marie Widor',
        work: 'Symphony No. 5: Toccata',
        note: 'Racing hands over a deep melody in the feet. A wedding favourite.',
      },
      {
        composer: 'Camille Saint-Saëns',
        work: 'Symphony No. 3, “Organ”: finale',
        note: 'The organ enters with a huge chord that fills the hall.',
      },
      {
        composer: 'Olivier Messiaen',
        work: 'La Nativité du Seigneur: Dieu parmi nous',
        note: 'Colours and chords only an organ can sustain.',
      },
    ],
    didYouKnow: [
      'Mozart called the organ “the king of instruments” in a letter of 1777, and the name stuck.',
      'The organ with the most pipes in the world is in Boardwalk Hall in Atlantic City, in the United States, with more than thirty thousand pipes.',
    ],
  },
  {
    key: 'violin',
    name: 'Violin',
    when: 'Cremona, around 1550',
    lede: 'The violin is the smallest and highest member of the string family, and the one closest to the human voice. The finest are still those made in Cremona more than three hundred years ago.',
    howItWorks:
      'It has four strings tuned G, D, A and E, a fifth apart. The bow, horsehair rubbed with rosin, grips and releases the string hundreds of times a second, and the string vibrates. The bridge passes the vibration to the spruce top, and the hollow body amplifies it. A small wooden dowel hidden inside, the soundpost, links top and back and shapes the tone a great deal.',
    story: [
      'The earliest surviving violins were made by Andrea Amati in Cremona, Italy, around 1560. The town became the centre of the craft: his grandson Nicolò Amati taught the next generation, which produced Antonio Stradivari and the Guarneri family. Instruments made there between 1650 and 1750 remain the most coveted.',
      'In the Baroque, the violin went from dance instrument to star. Corelli and Vivaldi wrote sonatas and concertos that demanded new technique, and Bach left six Sonatas and Partitas for violin alone. Late in the eighteenth century, the French bow maker François Tourte created the modern bow, longer and curved inwards, able to give more volume and a wider range of strokes.',
      'In the nineteenth century, Niccolò Paganini turned the violin into a virtuoso spectacle, and the great Romantic concertos, by Beethoven, Mendelssohn, Brahms and Tchaikovsky, became the repertoire soloists still play. In the orchestra, the violins are the largest section, divided into firsts and seconds.',
    ],
    timeline: [
      { year: 'c. 1560', text: 'Andrea Amati’s oldest violins, in Cremona.' },
      { year: '1700–1720', text: 'Antonio Stradivari’s golden period.' },
      {
        year: '1720',
        text: 'Bach writes the Sonatas and Partitas for solo violin.',
      },
      { year: 'c. 1785', text: 'François Tourte creates the modern bow.' },
    ],
    repertoire:
      'Vivaldi, Bach, the Romantic concertos of Beethoven, Mendelssohn, Brahms and Tchaikovsky, Paganini’s Caprices and, in the twentieth century, Sibelius, Prokofiev, Bartók and Berg. In Brazil, Villa-Lobos and Camargo Guarnieri wrote for the instrument.',
    listenFirst: [
      {
        composer: 'Antonio Vivaldi',
        work: 'The Four Seasons: Summer, presto',
        note: 'The solo violin is the hailstorm.',
      },
      {
        composer: 'Johann Sebastian Bach',
        work: 'Partita No. 2: Chaconne',
        note: 'Fifteen minutes of one violin sounding like an orchestra.',
      },
      {
        composer: 'Felix Mendelssohn',
        work: 'Violin Concerto in E minor',
        note: 'The soloist enters in the second bar with an unforgettable tune.',
      },
      {
        composer: 'Niccolò Paganini',
        work: 'Caprice No. 24',
        note: 'A theme and variations that tests every technique on the instrument.',
      },
    ],
    didYouKnow: [
      'About six hundred Stradivari instruments survive. His best violins have sold for more than fifteen million dollars.',
      'Paganini’s favourite violin, a Guarneri nicknamed Il Cannone for its powerful sound, is kept at Genoa’s city hall and is still played on special occasions.',
    ],
  },
  {
    key: 'viola',
    name: 'Viola',
    when: 'Italy, around 1550',
    lede: 'The viola is a little larger than the violin and sounds a fifth lower. It sits in the middle of the orchestra and the quartet, with a darker, velvety tone.',
    howItWorks:
      'It has four strings tuned C, G, D and A, and is held on the shoulder like the violin. Its size is not standardised: each player chooses a body that fits the arm. Viola music is written in the alto clef, which almost no other instrument uses, because the viola’s range lies between the violins and the cellos.',
    story: [
      'The viola was born alongside the violin, in the workshops of northern Italy in the sixteenth century. For a long time its job was to fill in the harmony in the middle of the orchestra, and it got little music of its own.',
      'In the Classical period, the string quartet gave the viola more prominence. Mozart liked to play it in quartet gatherings, and we know of an evening in Vienna, in 1784, when he took the viola in a quartet with Haydn, Dittersdorf and Vanhal. His Sinfonia Concertante, K. 364, puts violin and viola side by side as soloists.',
      'The nineteenth century still viewed the viola with suspicion, but Berlioz wrote Harold en Italie for it, and in the twentieth century concertos and sonatas by Hindemith, himself a violist, Walton and Bartók established its solo repertoire.',
    ],
    timeline: [
      { year: '16th c.', text: 'Born with the violin in northern Italy.' },
      {
        year: '1779',
        text: 'Mozart writes the Sinfonia Concertante for violin and viola.',
      },
      { year: '1834', text: 'Berlioz composes Harold en Italie.' },
      {
        year: '1945',
        text: 'Bartók dies leaving a viola concerto unfinished.',
      },
    ],
    repertoire:
      'The quartets of Haydn, Mozart and Beethoven give the viola the middle voice. As soloist: Mozart, Berlioz, Brahms (the two Op. 120 sonatas, also for clarinet), Hindemith, Walton and Bartók.',
    listenFirst: [
      {
        composer: 'Wolfgang Amadeus Mozart',
        work: 'Sinfonia Concertante, K. 364: Andante',
        note: 'Violin and viola converse like two opera singers.',
      },
      {
        composer: 'Hector Berlioz',
        work: 'Harold en Italie',
        note: 'The viola is the character wandering the Italian mountains.',
      },
      {
        composer: 'Johannes Brahms',
        work: 'Viola Sonata Op. 120 No. 2',
        note: 'Warm and autumnal, written late in Brahms’s life.',
      },
      {
        composer: 'Béla Bartók',
        work: 'Viola Concerto',
        note: 'The composer’s last work, completed after his death by his friend Tibor Serly.',
      },
    ],
    didYouKnow: [
      'Paganini commissioned Harold en Italie from Berlioz, then declined to play it because he felt the viola had too many rests.',
      'Violists have been the butt of musicians’ jokes for centuries, and they tend to tell the best ones themselves.',
    ],
  },
  {
    key: 'cello',
    name: 'Cello',
    when: 'Italy, around 1560',
    lede: 'The cello has the range closest to the human voice, from deep bass to high tenor. Played seated, with the instrument between the knees, it can sing and can carry the whole orchestra.',
    howItWorks:
      'It has four strings tuned C, G, D and A, an octave below the viola. The instrument rests on the floor on a metal spike, the endpin, and the player sits with the bow crossing the body. Its large body gives the low notes a full sound and the high notes a brightness close to singing.',
    story: [
      'The cello appeared in the mid-sixteenth century, in the workshops of Andrea Amati and other Italian makers, under the name violone and its variants. At first it served almost only to play the bass line of the continuo.',
      'Late in the seventeenth century, strings with a gut core wound in metal let the instrument become smaller and nimbler, and it gained a solo repertoire. Bach wrote six Suites for solo cello, Vivaldi dozens of concertos, and Boccherini, a cellist himself, sonatas and concertos. The endpin only became standard in the nineteenth century; before that, the cello was held between the legs.',
      'In the Romantic era and the twentieth century, the cello gained concertos by Schumann, Dvořák, Elgar and Shostakovich. Villa-Lobos wrote the Bachianas Brasileiras No. 1 for an orchestra of cellos alone, and the Catalan Pablo Casals changed the instrument’s history by recording Bach’s Suites.',
    ],
    timeline: [
      { year: 'c. 1560', text: 'The first instruments, still called violone.' },
      { year: 'c. 1720', text: 'Bach writes the six Suites for solo cello.' },
      { year: '19th c.', text: 'The endpin becomes standard.' },
      { year: '1936–1939', text: 'Pablo Casals records Bach’s Suites.' },
    ],
    repertoire:
      'Bach’s Suites, the concertos of Haydn, Boccherini, Schumann, Dvořák, Elgar and Shostakovich, the sonatas of Beethoven and Brahms. In Brazil, Villa-Lobos gave the instrument the Bachianas No. 1 and the core of the Bachianas No. 5.',
    listenFirst: [
      {
        composer: 'Johann Sebastian Bach',
        work: 'Suite No. 1: Prelude',
        note: 'Broken chords on a single cello. Perhaps the best-known piece for the instrument.',
      },
      {
        composer: 'Camille Saint-Saëns',
        work: 'The Carnival of the Animals: The Swan',
        note: 'A long melody over rippling piano.',
      },
      {
        composer: 'Antonín Dvořák',
        work: 'Cello Concerto',
        note: 'The most played concerto in the repertoire, full of Bohemian tunes.',
      },
      {
        composer: 'Edward Elgar',
        work: 'Cello Concerto',
        note: 'It opens with solo chords that sound like a painful memory.',
      },
    ],
    didYouKnow: [
      'Pablo Casals found Bach’s Suites at thirteen, in a second-hand music shop in Barcelona. He studied them for more than ten years before playing them in public.',
      'Saint-Saëns barred The Carnival of the Animals from publication during his life, thinking it too frivolous. He allowed only The Swan.',
    ],
  },
  {
    key: 'double-bass',
    name: 'Double bass',
    when: 'Europe, 16th century',
    lede: 'The double bass is the largest and lowest string instrument in the orchestra. Almost always at the back of the stage, it lays the floor everything else stands on.',
    howItWorks:
      'Unlike the rest of the family, it is tuned in fourths, E, A, D and G, so the hand can reach the notes without huge stretches. Its music sounds an octave lower than written, to avoid endless ledger lines. Players stand or sit on a high stool, using the bow or plucking the strings, pizzicato. There are two kinds of bow, French and German, held in different ways.',
    story: [
      'The double bass descends from the violone, the low member of the viol family, which is why it has sloping shoulders and is tuned in fourths, unlike the violin. In the Baroque and Classical periods it doubled the cello line an octave lower.',
      'Two virtuosos changed its reputation. Domenico Dragonetti, a friend of Beethoven, played in London and astonished audiences with his technique. In the nineteenth century, Giovanni Bottesini, called the Paganini of the double bass, wrote concertos and fantasias to show that it could sing too.',
      'In the twentieth century, the double bass found another stage in jazz, played pizzicato. In concert music, composers such as Saint-Saëns and Mahler gave it memorable solos, and today it has its own competitions and solo repertoire.',
    ],
    timeline: [
      { year: '16th c.', text: 'Born from the violone, of the viol family.' },
      { year: 'c. 1800', text: 'Dragonetti shines in London.' },
      {
        year: '1819',
        text: 'Schubert writes the double bass into the “Trout” Quintet.',
      },
      {
        year: '20th c.',
        text: 'It becomes the foundation of jazz, played pizzicato.',
      },
    ],
    repertoire:
      'In the orchestra, the whole symphonic repertoire. As soloist: the concertos of Dittersdorf, Vanhal and Koussevitzky and the works of Bottesini. In chamber music, Schubert’s “Trout” Quintet.',
    listenFirst: [
      {
        composer: 'Camille Saint-Saëns',
        work: 'The Carnival of the Animals: The Elephant',
        note: 'The double bass dances a heavy, comic waltz.',
      },
      {
        composer: 'Gustav Mahler',
        work: 'Symphony No. 1: third movement',
        note: 'It begins with a solo double bass playing Frère Jacques in a minor key, like a funeral march.',
      },
      {
        composer: 'Franz Schubert',
        work: '“Trout” Quintet: theme and variations',
        note: 'The double bass gives weight to a group with only one violin.',
      },
      {
        composer: 'Giovanni Bottesini',
        work: 'Double Bass Concerto No. 2',
        note: 'Shows how lyrical and agile the instrument can be.',
      },
    ],
    didYouKnow: [
      'Dragonetti played Beethoven’s G minor cello sonata with the composer, taking the cello part on a double bass. The story goes that it changed what Beethoven asked of the basses in the orchestra.',
      'Some bassists fit a mechanical extension to the lowest string to reach a low C, a note the orchestra asks for in Beethoven and Mahler.',
    ],
  },
  {
    key: 'harp',
    name: 'Harp',
    when: 'Egypt and Mesopotamia, more than 4,000 years ago',
    lede: 'The harp is one of the oldest instruments there is. The concert harp, with 47 strings and seven pedals, can play in any key and gives the orchestra a shimmer no other instrument has.',
    howItWorks:
      'The strings are plucked with the fingers, without the little finger, and each string plays one note. To change key, the harpist uses seven pedals, one for each note of the scale (all the Cs, all the Ds and so on). Each pedal has three positions, making the note flat, natural or sharp. The C strings are red and the F strings black or blue, so the harpist can find their way.',
    story: [
      'Egyptian paintings more than four thousand years old already show harps, and tombs in Mesopotamia held richly decorated string instruments. In the Middle Ages the harp accompanied bards and minstrels, and in Ireland and Wales it became a national symbol.',
      'The problem was playing in many keys. Harps with hooks, then with simple pedals, solved it in part. In 1810 the French maker Sébastien Érard patented the double-action pedal harp still used today, in which each pedal has three positions.',
      'With it, the harp became a fixture of the Romantic orchestra, with Berlioz, Wagner and Tchaikovsky, and gained solo and chamber repertoire from Debussy, Ravel and Fauré.',
    ],
    timeline: [
      {
        year: 'c. 3000 BC',
        text: 'Harps appear in the art of Egypt and Mesopotamia.',
      },
      {
        year: 'Middle Ages',
        text: 'The bards’ instrument and a symbol of Ireland.',
      },
      { year: '1810', text: 'Érard patents the double-action pedal harp.' },
      {
        year: '1904–1905',
        text: 'Debussy and Ravel write key works for the harp.',
      },
    ],
    repertoire:
      'Handel wrote a harp concerto, Mozart the Concerto for Flute and Harp, K. 299. Debussy (Danses sacrée et profane), Ravel (Introduction and Allegro) and Fauré gave the harp essential chamber works. In the orchestra it graces Tchaikovsky’s ballets and Wagner’s operas.',
    listenFirst: [
      {
        composer: 'Wolfgang Amadeus Mozart',
        work: 'Concerto for Flute and Harp, K. 299',
        note: 'Written in Paris for a duke who played the flute and his daughter, a harpist.',
      },
      {
        composer: 'Maurice Ravel',
        work: 'Introduction and Allegro',
        note: 'Harp, string quartet, flute and clarinet in a luminous piece.',
      },
      {
        composer: 'Claude Debussy',
        work: 'Danses sacrée et profane',
        note: 'Two dances, one solemn and one light, for harp and strings.',
      },
      {
        composer: 'Pyotr Tchaikovsky',
        work: 'The Nutcracker: Waltz of the Flowers',
        note: 'It opens with a long cadenza for harp alone.',
      },
    ],
    didYouKnow: [
      'The harp is on Ireland’s coat of arms and is the symbol of Guinness, which registered the design facing the other way.',
      'Ravel’s Introduction and Allegro was commissioned by the Érard firm to show off its pedal harp, and Debussy’s Danses by its rival Pleyel, to promote a chromatic harp that never caught on.',
    ],
  },
  {
    key: 'guitar',
    name: 'Classical guitar',
    when: 'Spain, 16th century',
    lede: 'The classical guitar is the most played string instrument in the world. It moved from Spanish streets and salons to the concert hall in the twentieth century, and in Brazil it grew a tradition of its own.',
    howItWorks:
      'It has six strings, now nylon, tuned E, A, D, G, B and E. The player plucks with the fingers and nails of the right hand and presses the strings against the frets with the left. The top, usually spruce or cedar, is braced inside with wooden struts in a fan pattern, which shapes much of the sound.',
    story: [
      'In sixteenth-century Spain, the vihuela, with paired strings, had a refined repertoire, while a smaller guitar with four and then five courses of strings was played everywhere. Around 1800 the instrument settled on six single strings, and Fernando Sor, in Paris and London, and Mauro Giuliani, in Vienna, wrote for it.',
      'The modern shape came from the Spanish maker Antonio de Torres, who from 1850 enlarged the body and fixed the fan bracing. Francisco Tárrega created modern technique and pieces such as Recuerdos de la Alhambra. In the twentieth century, Andrés Segovia brought the guitar to the great halls and asked composers such as Villa-Lobos, Castelnuovo-Tedesco and Manuel Ponce for new works. After the Second World War, nylon strings replaced gut.',
      'In Brazil, the guitar underpins choro, samba and bossa nova, and it also has a concert tradition. Villa-Lobos wrote the Twelve Études and Five Preludes, and guitarists such as Dilermando Reis, Garoto, Baden Powell and the Assad Duo moved between popular and classical music.',
    ],
    timeline: [
      { year: '16th c.', text: 'Vihuela and four-course guitar in Spain.' },
      { year: 'c. 1800', text: 'The guitar with six single strings.' },
      { year: 'c. 1850', text: 'Antonio de Torres defines the modern guitar.' },
      {
        year: '1939',
        text: 'Joaquín Rodrigo writes the Concierto de Aranjuez.',
      },
    ],
    repertoire:
      'Sor, Giuliani and Tárrega form the Classical and Romantic core. In the twentieth century Villa-Lobos, Rodrigo, Ponce, Britten (Nocturnal), Brouwer and Piazzolla expanded the repertoire. Much Baroque lute music, including Bach’s, is played on the guitar.',
    listenFirst: [
      {
        composer: 'Francisco Tárrega',
        work: 'Recuerdos de la Alhambra',
        note: 'The tremolo, one note repeated very fast, imitates a fountain.',
      },
      {
        composer: 'Joaquín Rodrigo',
        work: 'Concierto de Aranjuez: Adagio',
        note: 'Cor anglais and guitar share one of the century’s most famous melodies.',
      },
      {
        composer: 'Heitor Villa-Lobos',
        work: 'Prelude No. 1',
        note: 'A melody in the bass, with the flavour of Rio’s serenades.',
      },
      {
        composer: 'Agustín Barrios',
        work: 'La Catedral',
        note: 'Three movements inspired by a cathedral in Montevideo.',
      },
    ],
    didYouKnow: [
      'Villa-Lobos learned the guitar against his mother’s wishes, since she frowned on Rio’s choro gatherings, where he played as a young man.',
      'The first nylon guitar strings were developed by DuPont with the maker Albert Augustine, tested by Segovia, who could not find good gut strings during the war.',
    ],
  },
  {
    key: 'flute',
    name: 'Flute',
    when: 'Prehistory; modern flute in 1847',
    lede: 'Bone flutes more than 35,000 years old are among the oldest instruments ever found. The modern transverse flute, metal and full of keys, dates from 1847.',
    howItWorks:
      'The flute has no reed. The player blows across a hole, like sounding a bottle, and the air splits on the edge and sets the column of air inside the tube vibrating. Fingers open and close holes through keys, changing the length of that column and so the note. Blowing harder with tighter lips makes the flute jump to its upper register.',
    story: [
      'In the Hohle Fels cave in Germany, archaeologists found a flute made from a vulture’s wing bone more than 35,000 years old. Flutes of many kinds have existed in almost every culture. In Europe, the recorder, held vertically, dominated the Renaissance, and the wooden one-keyed transverse flute gained ground in the Baroque.',
      'King Frederick the Great of Prussia played the flute, composed for it, and studied with Johann Joachim Quantz, who wrote a famous treatise on the instrument. Bach wrote a Partita for solo flute, and Mozart, who claimed not to like it much, left two concertos and a quartet.',
      'In 1847 the German flautist and goldsmith Theobald Boehm created the metal flute with a cylindrical bore and a key system that plays in tune in every key. It is the flute still in use. In the twentieth century Debussy wrote Syrinx for flute alone, and in Brazil the flute is the lead voice of choro, with masters such as Pixinguinha and Altamiro Carrilho.',
    ],
    timeline: [
      { year: 'c. 35,000 BC', text: 'The vulture-bone flute from Hohle Fels.' },
      {
        year: 'Renaissance',
        text: 'The recorder dominates instrumental music.',
      },
      {
        year: '18th c.',
        text: 'The wooden Baroque flute at the Prussian court.',
      },
      { year: '1847', text: 'Theobald Boehm creates the modern metal flute.' },
    ],
    repertoire:
      'Bach, Telemann, Quantz and Vivaldi in the Baroque; Mozart in the Classical period; Debussy, Ravel, Poulenc, Prokofiev and Varèse (Density 21.5) in the twentieth century. In the orchestra, memorable solos in the Prélude à l’après-midi d’un faune and Daphnis et Chloé.',
    listenFirst: [
      {
        composer: 'Claude Debussy',
        work: 'Prélude à l’après-midi d’un faune',
        note: 'It opens with the flute alone in a melody that will not settle.',
      },
      {
        composer: 'Claude Debussy',
        work: 'Syrinx',
        note: 'Three minutes for solo flute, about the god Pan.',
      },
      {
        composer: 'Wolfgang Amadeus Mozart',
        work: 'Flute Concerto No. 1, K. 313',
        note: 'Light and elegant, a portrait of the Classical style.',
      },
      {
        composer: 'Pixinguinha',
        work: 'Carinhoso',
        note: 'The choro that is almost a Brazilian anthem, with the flute in front.',
      },
    ],
    didYouKnow: [
      'In the orchestra the flute has a smaller, higher relative, the piccolo, which sounds an octave up and cuts through the whole orchestra even at full volume.',
      'Varèse’s Density 21.5 is named after the density of platinum, the metal of the flute owned by the soloist who commissioned it.',
    ],
  },
  {
    key: 'oboe',
    name: 'Oboe',
    when: 'French court, around 1650',
    lede: 'The oboe has a penetrating, expressive sound that carries through the whole orchestra. It gives the note everyone tunes to before the concert.',
    howItWorks:
      'The oboe uses a double reed: two thin blades of cane tied together, which vibrate when the player blows between them. The reed sits at the top of a conical wooden tube, usually grenadilla, with metal keys. Most oboists make their own reeds by hand, and the reeds change the sound a great deal.',
    story: [
      'The oboe descends from the shawm, a loud double-reed instrument played outdoors in the Middle Ages. Around 1650, musicians at the court of Louis XIV, such as the Hotteterre family, created a gentler instrument in three joints, for playing indoors. The name comes from the French hautbois, high wood.',
      'The new oboe spread quickly. In the Baroque, Bach used it in almost every cantata, often alongside the voice, and Vivaldi, Albinoni and Marcello wrote concertos for it. In the Classical period, Mozart composed his Concerto in C major and the Oboe Quartet.',
      'In the nineteenth century it received a fuller key system, and in the twentieth gained works by Richard Strauss, Poulenc and Britten. The family includes the lower oboe d’amore and the cor anglais, which is neither English nor a horn.',
    ],
    timeline: [
      { year: 'Middle Ages', text: 'The double-reed shawm plays outdoors.' },
      { year: 'c. 1650', text: 'The oboe is born at the court of Louis XIV.' },
      { year: '1777', text: 'Mozart writes the Oboe Concerto in C major.' },
      { year: '1945', text: 'Richard Strauss composes his Oboe Concerto.' },
    ],
    repertoire:
      'Bach’s cantatas and Passions, the concertos of Vivaldi, Marcello and Albinoni, Mozart’s Concerto, Strauss’s, Poulenc’s sonata and Britten’s Six Metamorphoses after Ovid for solo oboe.',
    listenFirst: [
      {
        composer: 'Alessandro Marcello',
        work: 'Oboe Concerto in D minor: Adagio',
        note: 'A melody so beautiful that Bach arranged it for harpsichord.',
      },
      {
        composer: 'Wolfgang Amadeus Mozart',
        work: 'Oboe Concerto in C major, K. 314',
        note: 'Cheerful and virtuosic, full of ornaments.',
      },
      {
        composer: 'Pyotr Tchaikovsky',
        work: 'Swan Lake: the swan theme',
        note: 'The oboe sings the ballet’s main theme.',
      },
      {
        composer: 'Richard Strauss',
        work: 'Oboe Concerto',
        note: 'Written at the end of the Second World War, with barely a pause to breathe.',
      },
    ],
    didYouKnow: [
      'The oboe gives the orchestra its A because its pitch is stable and its sound stands out from the other instruments.',
      'Strauss’s Concerto grew out of a question from an American soldier, John de Lancie, an oboist, who visited him in 1945 and asked whether he had ever thought of writing for the instrument.',
    ],
  },
  {
    key: 'clarinet',
    name: 'Clarinet',
    when: 'Nuremberg, around 1700',
    lede: 'The clarinet is the youngest of the orchestra’s woodwinds and one of the most versatile. It ranges from a barely audible whisper to a shout, and it has lived in concert music, jazz, klezmer and choro.',
    howItWorks:
      'It uses a single reed, fixed to a mouthpiece, which vibrates against it as the player blows. The tube is cylindrical, so the clarinet overblows not to the octave, like the flute and oboe, but to the note a twelfth higher. That gives it registers with very different colours: the low one, dark and warm, called chalumeau, and the middle and high ones, brighter.',
    story: [
      'Around 1700, in Nuremberg, Johann Christoph Denner added a key to a simple instrument called the chalumeau and created the clarinet. The name comes from clarino, the high register of the trumpet, which the new instrument recalled.',
      'Mozart helped establish the clarinet in concert music. Charmed by the playing of Anton Stadler, he wrote for him the Quintet, K. 581, and the Concerto, K. 622, one of his last works. In the nineteenth century Carl Maria von Weber wrote concertos for Heinrich Baermann, and Brahms, already thinking of retiring, started composing again after hearing Richard Mühlfeld and left four masterpieces for the clarinet.',
      'In the twentieth century the clarinet became a jazz star with Benny Goodman, who commissioned works from Bartók and Copland. Gershwin’s Rhapsody in Blue opens with a famous clarinet glissando. In Brazil it is one of the core instruments of choro, with Abel Ferreira and Paulo Moura.',
    ],
    timeline: [
      { year: 'c. 1700', text: 'Denner creates the clarinet in Nuremberg.' },
      {
        year: '1789–1791',
        text: 'Mozart writes the Quintet and Concerto for Stadler.',
      },
      { year: '1891', text: 'Brahms composes again because of Mühlfeld.' },
      { year: '1924', text: 'The glissando that opens Rhapsody in Blue.' },
    ],
    repertoire:
      'Mozart, Weber and Brahms form the Classical and Romantic core. In the twentieth century: Debussy (Première Rhapsodie), Stravinsky (Three Pieces), Poulenc, Copland, Bartók (Contrasts) and Messiaen (Abîme des oiseaux).',
    listenFirst: [
      {
        composer: 'Wolfgang Amadeus Mozart',
        work: 'Clarinet Concerto, K. 622: Adagio',
        note: 'One of Mozart’s most serene melodies.',
      },
      {
        composer: 'Johannes Brahms',
        work: 'Clarinet Quintet, Op. 115',
        note: 'Autumnal and nostalgic, written for Mühlfeld.',
      },
      {
        composer: 'George Gershwin',
        work: 'Rhapsody in Blue',
        note: 'The clarinet slides up two octaves right at the start.',
      },
      {
        composer: 'Olivier Messiaen',
        work: 'Quartet for the End of Time: Abîme des oiseaux',
        note: 'Clarinet alone, between silences and birdsong.',
      },
    ],
    didYouKnow: [
      'The Rhapsody in Blue glissando was born in rehearsal: Ross Gorman, clarinettist in Paul Whiteman’s band, slid up the scale as a joke, and Gershwin asked him to keep it.',
      'Mozart wrote the Concerto for a special clarinet of Stadler’s that went lower. The original score is lost, and what is played today is an adaptation for the standard clarinet.',
    ],
  },
  {
    key: 'bassoon',
    name: 'Bassoon',
    when: 'Europe, 16th century',
    lede: 'The bassoon is the bass of the woodwinds. With more than two metres of tube folded in half, it can be comic, melancholy or eerie, and it has one of the most famous solos of the twentieth century.',
    howItWorks:
      'Like the oboe, it uses a double reed, fitted to a curved metal tube, the bocal. The wooden tube is about two and a half metres long, folded into a U so it fits the hands. The player covers holes with the fingers and works many keys, including with the thumbs. Its bigger cousin, the contrabassoon, goes an octave lower and is the lowest instrument in the orchestra.',
    story: [
      'The bassoon descends from the dulcian, a Renaissance double-reed instrument carved from a single block of wood. In the seventeenth century it gained separate joints and the shape we know.',
      'In the Baroque it doubled the continuo bass with the cello, and Vivaldi wrote dozens of concertos for it, more than for any other wind instrument. Mozart composed his Bassoon Concerto at eighteen. In the nineteenth century German makers, such as Heckel, and French makers developed different key systems, both still in use.',
      'Composers made use of its many personalities: Dukas gave it the enchanted brooms in The Sorcerer’s Apprentice, Prokofiev the grandfather in Peter and the Wolf, and Stravinsky opened The Rite of Spring with the bassoon at the top of its range, a strange sound few recognised.',
    ],
    timeline: [
      { year: '16th c.', text: 'The dulcian, carved in one piece.' },
      { year: '17th c.', text: 'The bassoon in separate joints.' },
      { year: '1774', text: 'Mozart writes the Bassoon Concerto.' },
      { year: '1913', text: 'The high solo that opens The Rite of Spring.' },
    ],
    repertoire:
      'Vivaldi’s concertos, Mozart’s and Weber’s; Saint-Saëns’s Sonata; famous orchestral solos in Dukas, Stravinsky, Tchaikovsky (Symphony No. 4) and Ravel (Boléro).',
    listenFirst: [
      {
        composer: 'Igor Stravinsky',
        work: 'The Rite of Spring: introduction',
        note: 'The bassoon alone, so high it sounds like another instrument.',
      },
      {
        composer: 'Paul Dukas',
        work: 'The Sorcerer’s Apprentice',
        note: 'The brooms march to the sound of the bassoons.',
      },
      {
        composer: 'Wolfgang Amadeus Mozart',
        work: 'Bassoon Concerto, K. 191',
        note: 'Mozart at eighteen, playing with leaps and low notes.',
      },
      {
        composer: 'Camille Saint-Saëns',
        work: 'Sonata for Bassoon and Piano',
        note: 'One of the composer’s last works, lyrical and light.',
      },
    ],
    didYouKnow: [
      'At the premiere of The Rite, the story goes, Saint-Saëns heard the opening, asked what instrument that was, and walked out.',
      'Vivaldi wrote about forty bassoon concertos, probably for players and pupils at the Ospedale della Pietà in Venice.',
    ],
  },
  {
    key: 'horn',
    name: 'Horn',
    when: 'French court, around 1650',
    lede: 'The horn was born on the hunt and became the most versatile brass instrument in the orchestra. Its round sound can be heroic, distant or nostalgic, and it blends with brass and woodwinds alike.',
    howItWorks:
      'The sound starts at the player’s lips, buzzing into the mouthpiece, as with all brass. The tube, coiled in circles, is about four metres long, and the bell faces backwards. Valves route the air through extra lengths of tubing and change the note. The right hand, inside the bell, adjusts tuning and tone and can even muffle the sound.',
    story: [
      'The hunting horn, a coiled tube with no valves, entered concert music in the late seventeenth century. This natural horn could play only the notes of one harmonic series, and to change key the player swapped lengths of tube, called crooks.',
      'In the eighteenth century, horn players found that placing the hand inside the bell in different positions let them play notes in between. With this technique Mozart wrote four concertos for his friend Joseph Leutgeb, and Beethoven and Brahms wrote demanding solos for the natural horn.',
      'Valves, patented in Germany in 1818, made every note easy to play. The Romantic orchestra came to use four horns or more, and Wagner, Richard Strauss, Mahler and Tchaikovsky gave them some of the repertoire’s most famous solos.',
    ],
    timeline: [
      { year: 'c. 1650', text: 'The hunting horn enters court music.' },
      { year: 'c. 1760', text: 'The technique of the hand in the bell.' },
      { year: '1783–1791', text: 'Mozart’s four concertos for Leutgeb.' },
      { year: '1818', text: 'Valves patented in Germany.' },
    ],
    repertoire:
      'The concertos of Mozart and Richard Strauss, Brahms’s Trio Op. 40, orchestral solos in Beethoven, Brahms, Tchaikovsky, Wagner and Mahler. Many film scores give the horn their heroic tunes.',
    listenFirst: [
      {
        composer: 'Wolfgang Amadeus Mozart',
        work: 'Horn Concerto No. 4, K. 495: rondo',
        note: 'A finale that imitates a hunt on horseback.',
      },
      {
        composer: 'Pyotr Tchaikovsky',
        work: 'Symphony No. 5: second movement',
        note: 'A long, tender horn solo over the strings.',
      },
      {
        composer: 'Richard Strauss',
        work: 'Till Eulenspiegel',
        note: 'The horn introduces the rascal Till right at the start.',
      },
      {
        composer: 'Johannes Brahms',
        work: 'Horn Trio, Op. 40',
        note: 'Written for the natural horn, which Brahms preferred.',
      },
    ],
    didYouKnow: [
      'In the manuscripts of the Leutgeb concertos, Mozart left jokes: insults scrawled over the solo line and inks of different colours to tease his friend.',
      'The horn is the only brass instrument played with the bell facing backwards, so its sound reaches the audience bounced off the wall behind the stage.',
    ],
  },
  {
    key: 'trumpet',
    name: 'Trumpet',
    when: 'Ancient Egypt, more than 3,000 years ago',
    lede: 'Trumpets have announced kings, battles and feasts for millennia. In the orchestra they bring brilliance and force to moments of triumph, and in the twentieth century they found a second life in jazz.',
    howItWorks:
      'The player buzzes the lips into the mouthpiece, and the metal tube, about one and a half metres coiled up, amplifies the sound. Three valves open extra lengths of tube so every note can be played. By changing lip tension and air pressure, the trumpeter picks the notes of each series. Mutes fitted into the bell change the tone, from muffled to metallic.',
    story: [
      'Two trumpets, one silver and one bronze, more than three thousand years old, were found in Tutankhamun’s tomb in Egypt. Through the Middle Ages and the Renaissance the trumpet was an instrument of ceremony and war, played by court musicians together with timpani.',
      'In the Baroque, the natural trumpet, without valves, reached the high notes where the harmonic series lies closest together, the clarino register. Bach and Handel wrote brilliant, fiendishly hard parts for it, as in the Brandenburg Concerto No. 2.',
      'In 1796 Haydn composed a concerto for Anton Weidinger’s keyed trumpet, which could already play every note. Valves arrived in the nineteenth century, and the modern trumpet gained celebrated solos in Mahler, Mussorgsky and Ravel. In jazz, Louis Armstrong, Miles Davis and Wynton Marsalis, who also records classical repertoire, made the trumpet a voice of its own.',
    ],
    timeline: [
      { year: 'c. 1320 BC', text: 'The trumpets of Tutankhamun’s tomb.' },
      { year: 'Baroque', text: 'The clarino register of the natural trumpet.' },
      {
        year: '1796',
        text: 'Haydn writes his concerto for the keyed trumpet.',
      },
      { year: '19th c.', text: 'Valves make every note possible.' },
    ],
    repertoire:
      'Bach (Brandenburg No. 2, Christmas Oratorio), Handel (Messiah), the concertos of Haydn and Hummel, and orchestral solos in Mahler (Symphony No. 5), Mussorgsky/Ravel (Pictures at an Exhibition) and Stravinsky.',
    listenFirst: [
      {
        composer: 'Joseph Haydn',
        work: 'Trumpet Concerto: finale',
        note: 'Bright and virtuosic, for the first trumpet that could play every note.',
      },
      {
        composer: 'Jeremiah Clarke',
        work: 'Prince of Denmark’s March',
        note: 'The well-known “Trumpet Voluntary,” long attributed to Purcell.',
      },
      {
        composer: 'Modest Mussorgsky / Maurice Ravel',
        work: 'Pictures at an Exhibition: Promenade',
        note: 'The trumpet alone opens the work.',
      },
      {
        composer: 'Gustav Mahler',
        work: 'Symphony No. 5: Funeral March',
        note: 'It begins with a lonely trumpet call.',
      },
    ],
    didYouKnow: [
      'Tutankhamun’s trumpets were played in a BBC broadcast in 1939. In rehearsal the silver one cracked when the player fitted it with a modern mouthpiece.',
      'For centuries court trumpeters formed a closed guild, and teaching the craft to outsiders was forbidden.',
    ],
  },
  {
    key: 'timpani',
    name: 'Timpani',
    when: 'Europe, 15th century',
    lede: 'Timpani are the orchestra’s tuned drums. Besides keeping rhythm, they play definite notes and can carry the drama of a whole symphony.',
    howItWorks:
      'Each timpano is a large copper bowl covered with a head, of calfskin or plastic. The tighter the head, the higher the note. On modern timpani a pedal tightens or loosens the head, so the player can retune in the middle of the music. Sticks with heads of felt, wood or other materials change the sound, from soft to dry.',
    story: [
      'Timpani came from the Middle East, where bowl-shaped drums, the naqqara, accompanied mounted armies. In the fifteenth century they reached European courts, always paired with trumpets, as a symbol of power.',
      'In the Baroque they entered the orchestra with the trumpets, usually playing two notes, the tonic and the dominant, to mark festive moments. Haydn, Mozart and Beethoven also began to use them to create tension and surprise.',
      'In the nineteenth century Berlioz asked for several timpanists at once, and late in the century pedal timpani appeared, able to change notes quickly. Composers such as Bartók began writing glissandos and melodies for them.',
    ],
    timeline: [
      {
        year: '15th c.',
        text: 'They reach European courts with the trumpets.',
      },
      { year: 'Baroque', text: 'They enter the orchestra in pairs.' },
      {
        year: '1830',
        text: 'Berlioz uses four timpanists in the Symphonie fantastique.',
      },
      { year: 'late 19th c.', text: 'Pedal timpani.' },
    ],
    repertoire:
      'Timpani are in almost the whole symphonic repertoire. High points: Haydn (Symphony No. 103), Beethoven (Violin Concerto and Symphony No. 9), Berlioz (Symphonie fantastique), Richard Strauss (Also sprach Zarathustra) and Bartók (Music for Strings, Percussion and Celesta).',
    listenFirst: [
      {
        composer: 'Joseph Haydn',
        work: 'Symphony No. 103, “Drumroll”',
        note: 'The symphony opens with a timpani roll on its own.',
      },
      {
        composer: 'Ludwig van Beethoven',
        work: 'Violin Concerto: opening',
        note: 'Five soft timpani strokes open the concerto.',
      },
      {
        composer: 'Richard Strauss',
        work: 'Also sprach Zarathustra: introduction',
        note: 'The timpani answer the brass in music’s most famous sunrise.',
      },
      {
        composer: 'Hector Berlioz',
        work: 'Symphonie fantastique: Scene in the Country',
        note: 'At the end, four timpanists imitate distant thunder.',
      },
    ],
    didYouKnow: [
      'In the scherzo of the Ninth Symphony, Beethoven tuned the timpani an octave apart, a rarity at the time, and the timpani even interrupt the orchestra.',
      'Timpanists often lean an ear close to the head, silently tapping, to check the tuning while the orchestra plays.',
    ],
  },
  {
    key: 'voice',
    name: 'Voice',
    when: 'Always',
    lede: 'The voice is the oldest instrument and the only one everybody carries. Almost all Western music began as song, and the voice remains at the centre of opera, choral music and song.',
    howItWorks:
      'Air from the lungs sets the vocal folds in the larynx vibrating, and the throat, mouth and nose shape and amplify the sound. Classical singing trains breathing and the space inside to project the voice over an orchestra without a microphone. Voices are grouped by range and colour: soprano, mezzo-soprano and contralto among women; tenor, baritone and bass among men.',
    story: [
      'Gregorian chant, Renaissance polyphony and the madrigal were written for voices, often with no instruments at all. With opera, around 1600, came the solo singer and techniques to sing louder, longer and with more agility.',
      'In the seventeenth and eighteenth centuries the castrati, singers castrated as boys to keep their high voices, were the great stars of opera, Farinelli among them. In the nineteenth century the Italian bel canto of Rossini, Bellini and Donizetti prized beauty of tone and agility, and Verdi and Wagner demanded more powerful voices. At the same time Schubert and Schumann created the art song for voice and piano.',
      'In the twentieth century the voice explored new paths, from Schoenberg’s half-spoken singing to extended techniques. The early-music movement brought back the countertenor, a man singing in the high register, and small vocal groups revived the medieval and Renaissance repertoire.',
    ],
    timeline: [
      { year: '9th c.', text: 'Gregorian chant is put in order.' },
      { year: 'c. 1600', text: 'Opera and the solo singer are born.' },
      { year: '18th c.', text: 'The age of the castrati.' },
      { year: '19th c.', text: 'Bel canto and the Lied.' },
    ],
    repertoire:
      'Renaissance Masses and motets, operas from Monteverdi to Puccini, oratorios by Bach and Handel, Lieder by Schubert, Schumann and Brahms, songs by Fauré and Debussy. In Brazil, the art songs of Villa-Lobos, Camargo Guarnieri and Francisco Mignone.',
    listenFirst: [
      {
        composer: 'Wolfgang Amadeus Mozart',
        work: 'The Magic Flute: Der Hölle Rache',
        note: 'The Queen of the Night’s aria climbs to a stratospheric high F.',
      },
      {
        composer: 'Giacomo Puccini',
        work: 'Turandot: Nessun dorma',
        note: 'The most famous tenor aria in the world.',
      },
      {
        composer: 'Georges Bizet',
        work: 'Carmen: Habanera',
        note: 'A seductive mezzo-soprano over a Cuban dance rhythm.',
      },
      {
        composer: 'Heitor Villa-Lobos',
        work: 'Bachianas Brasileiras No. 5: Aria',
        note: 'The soprano sings without words over eight cellos.',
      },
    ],
    didYouKnow: [
      'For about ten years Farinelli sang the same four songs every night for King Philip V of Spain, who suffered from depression.',
      'The Queen of the Night’s aria was written for Mozart’s sister-in-law, Josepha Hofer, whose high range was exceptional.',
    ],
  },
];

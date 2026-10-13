import type { EraChapter } from './types';

export const ERAS_EN: EraChapter[] = [
  {
    key: 'medieval',
    lede: 'Almost all the medieval music we know was sung in churches and monasteries, because they were the ones who could write music down. Over nearly a thousand years, a single melody in Latin became two, three, then four voices at once.',
    story: [
      'The starting point is Gregorian chant, also called plainchant: Latin melodies sung in unison by monks, with no accompaniment. The name honours Pope Gregory I, who died in 604, but the credit is legend. The repertoire that reached us was put in order much later, in the eighth and ninth centuries, when the Carolingian kings wanted every church in their empire to sing the same way.',
      'Singing the same way in distant places meant writing it down. The first signs, called neumes, appeared in the ninth century and showed only the shape of the melody: up, down, a wave. Singers who already knew a chant used them as a reminder. Around 1025 the monk Guido of Arezzo proposed horizontal lines to fix the pitch of each note, and a method for teaching people to sing at sight. The staff we use today comes from there.',
      'The big news of the following centuries was singing more than one line at a time. At first, a second voice shadowed the chant at a fixed interval. In Paris around 1200, the musicians of Notre-Dame cathedral, Léonin and then Pérotin, wrote pieces in which new voices move freely and quickly over very long notes of the old chant. Pérotin went as far as four voices, a daring number for the time.',
      'Outside the church there were love songs. The troubadours of southern France wrote in Occitan, the trouvères in the north in Old French, and the Minnesänger in German. Little of this music survives with its melody written out, and almost none with its rhythm. From the same centuries comes Hildegard of Bingen, a German abbess who composed chants with wide, soaring lines and wrote the Ordo Virtutum, a musical drama about the virtues and the soul.',
      'In the fourteenth century, a treatise linked to Philippe de Vitry gave its name to a new art, the ars nova, with a notation able to record far more varied rhythms. The poet and composer Guillaume de Machaut wrote the Messe de Nostre Dame, the first complete polyphonic Mass we know by a single composer.',
    ],
    sound:
      'In Gregorian chant, listen for one line with no regular beat, following the rhythm of the Latin words. In the polyphony that came later, notice how the voices meet on fifths, fourths and octaves, which gives a hollow, bright sound. Thirds, which sound sweet to us, were treated as imperfect and almost never ended a phrase.',
    changes: [
      {
        title: 'Music gets written down',
        text: 'From neumes, which recalled the outline of a melody, to Guido of Arezzo’s staff. For the first time, someone could sing music they had never heard.',
      },
      {
        title: 'More than one voice at once',
        text: 'Organum adds a second voice to the chant. At Notre-Dame the voices gain independence and reach four.',
      },
      {
        title: 'Rhythm gets a notation',
        text: 'First as repeating patterns, then, with the ars nova, as note shapes able to record varied, layered rhythms.',
      },
      {
        title: 'Song in the people’s language',
        text: 'Troubadours and trouvères sing of love and chivalry in Occitan and French, far from the Latin of the church.',
      },
    ],
    forms: [
      {
        name: 'Gregorian chant',
        text: 'Unaccompanied Latin melody for the Mass and the daily hours of the monastery.',
      },
      {
        name: 'Organum',
        text: 'The old chant in long notes, with one or more new voices above it.',
      },
      {
        name: 'Motet',
        text: 'Several voices, each with its own text, sometimes in different languages at once.',
      },
      {
        name: 'Mass',
        text: 'The fixed parts of the service (Kyrie, Gloria, Credo, Sanctus, Agnus Dei) set in polyphony.',
      },
      {
        name: 'Fixed-form song',
        text: 'Ballade, rondeau and virelai: poems with refrains, each with its own pattern of repeats.',
      },
    ],
    instruments: [
      'Voice',
      'Organ',
      'Vielle',
      'Harp',
      'Psaltery',
      'Lute',
      'Recorder',
      'Shawm',
    ],
    listenFirst: [
      {
        composer: 'Anonymous',
        work: 'Victimae paschali laudes',
        workId: '6877f70dc9181a7b52adcbf8',
        note: 'A Gregorian sequence for Easter. Good for feeling unison chant, unhurried.',
      },
      {
        composer: 'Hildegard of Bingen',
        work: 'O vis aeternitatis',
        workId: '686b82de4206d8332943f8d6',
        note: 'Very wide lines that climb and fall a whole octave in a few notes.',
      },
      {
        composer: 'Pérotin',
        work: 'Viderunt omnes',
        note: 'Four voices dancing over notes that last several seconds. It sounds like a cathedral.',
      },
      {
        composer: 'Anonymous',
        work: 'Sumer is icumen in',
        workId: '68712edcd4375027987db035',
        note: 'A thirteenth-century English round about summer arriving, with the cuckoo singing.',
      },
      {
        composer: 'Guillaume de Machaut',
        work: 'Messe de Nostre Dame',
        workId: '686a8fa5c93ef3be836d8835',
        note: 'Start with the Kyrie: four voices, interlocking rhythms, a rough and brilliant sound.',
      },
    ],
    didYouKnow: [
      'The names of the notes come from a hymn to Saint John the Baptist, Ut queant laxis. Each line starts one step higher than the last, and Guido used the opening syllables (ut, re, mi, fa, sol, la) to teach singing. Ut later became do, which is easier to sing.',
      'Sumer is icumen in is one of the oldest rounds known: up to six voices sing the same tune, entering one after another.',
      'Hildegard of Bingen also wrote about medicine, plants and mystical visions, and corresponded with popes and emperors.',
    ],
  },
  {
    key: 'renaissance',
    lede: 'In the Renaissance, the voices became equals and started to converse, imitating one another. Printing carried music to people who had never set foot in a cathedral.',
    story: [
      'In the early fifteenth century, composers from northern Europe, from what is now Belgium, northern France and the Netherlands, ran the richest chapels on the continent. Guillaume Du Fay and later Johannes Ockeghem wrote Masses in which every voice has its own melody, instead of one main voice with accompaniment.',
      'Josquin des Prez, who worked in Milan, Rome and Ferrara, brought this writing to a new balance. In imitation, the technique that defined the period, one voice states a phrase and the others repeat it shortly after, each at its own pitch. The result is a web in which no voice is in charge. Josquin also cared about the words: you can follow the text, and the music follows its meaning.',
      'In 1501, in Venice, Ottaviano Petrucci published the Harmonice Musices Odhecaton, the first book of polyphonic music printed with movable type. Until then, every copy was made by hand. With printing, the same piece reached many cities, and a composer could become famous far from home.',
      'The Protestant Reformation and the Catholic response changed church music. Luther wanted congregations singing in German, and from that came the Lutheran chorale, with a simple, steady tune. On the Catholic side, the Council of Trent debated whether polyphony made the text impossible to understand. Giovanni Pierluigi da Palestrina wrote Masses of model clarity, and a legend says his Missa Papae Marcelli persuaded the cardinals not to ban polyphony. There is no evidence for it, but Palestrina’s style became the textbook model for centuries.',
      'Outside the church, the Italian madrigal took over the courts: love poems sung in four or five parts, with the music drawing each word. In England, Thomas Tallis wrote Spem in alium for forty voices, and John Dowland composed lute songs of famous melancholy. Instruments, which used to double the voices, started to get music of their own.',
    ],
    sound:
      'Notice how a phrase passes from voice to voice, like an echo arriving from different places. Thirds and sixths now count as consonant, so the whole sounds softer and fuller than medieval music. In madrigals, follow the words: “sigh” often comes with a rest, “die” with a dissonance, “rise” with a climbing scale.',
    changes: [
      {
        title: 'Every voice counts the same',
        text: 'Imitation gives each line its own melody. The ear follows a web instead of one leading voice.',
      },
      {
        title: 'Printed music',
        text: 'From 1501, music books travel across Europe. Composers become names and repertoire spreads.',
      },
      {
        title: 'The words can be heard',
        text: 'Composers want the text understood, and the music paints its meaning.',
      },
      {
        title: 'Instruments find a voice',
        text: 'Lute, viol and keyboard stop merely accompanying and get dances, fantasias and variations.',
      },
    ],
    forms: [
      {
        name: 'Mass',
        text: 'Now fully in imitative polyphony, often built on a well-known melody.',
      },
      {
        name: 'Motet',
        text: 'A sacred piece in Latin, with a single text and voices that imitate one another.',
      },
      {
        name: 'Madrigal',
        text: 'A secular poem sung in several parts, with the music drawing the words.',
      },
      {
        name: 'Lutheran chorale',
        text: 'A hymn in German with a simple tune, for the congregation to sing together.',
      },
      {
        name: 'Pavane and galliard',
        text: 'A pair of dances, one slow and stately, the other quick and leaping.',
      },
      {
        name: 'Fantasia',
        text: 'A free instrumental piece that imitates the writing for voices.',
      },
    ],
    instruments: [
      'Unaccompanied voices',
      'Lute',
      'Viol',
      'Recorder',
      'Sackbut',
      'Cornett',
      'Organ',
      'Virginal',
    ],
    listenFirst: [
      {
        composer: 'Josquin des Prez',
        work: 'Ave Maria… virgo serena',
        workId: '68633073204a67621b0bf764',
        note: 'The voices enter one by one with the same phrase. Great for hearing imitation happen.',
      },
      {
        composer: 'Giovanni Pierluigi da Palestrina',
        work: 'Missa Papae Marcelli',
        workId: '686ab218c93ef3be836d8f8e',
        note: 'Perfect clarity: you can follow every line and understand the text.',
      },
      {
        composer: 'Thomas Tallis',
        work: 'Spem in alium',
        workId: '6870a4cfbc43a28afb5ab6fa',
        note: 'Forty independent voices. On headphones, the sound seems to circle around you.',
      },
      {
        composer: 'John Dowland',
        work: 'Flow, my tears',
        workId: '68668194e541852612dfff46',
        note: 'One voice and a lute. The best-known English song of the period.',
      },
      {
        composer: 'Carlo Gesualdo',
        work: 'Moro, lasso, al mio duolo',
        workId: '686ad622c93ef3be836d9726',
        note: 'A madrigal with chords so strange they sound like the twentieth century.',
      },
    ],
    didYouKnow: [
      'Spem in alium was written for eight choirs of five voices. In some passages all forty sing at once; in others the sound travels from choir to choir around the room.',
      'Before printing, copying a single Mass by hand could take weeks. The Odhecaton of 1501 gathered about a hundred pieces in one volume.',
      'Madrigalists called the habit of illustrating the text with music “word painting.” The effect was so well known that composers joked about it themselves.',
    ],
  },
  {
    key: 'baroque',
    lede: 'Around 1600, in Florence, a few musicians wanted music to serve drama. Out of that came opera, the basso continuo and a language of contrasts that runs until Bach’s death in 1750.',
    story: [
      'A group of Florentine thinkers, the Camerata, believed that Greek tragedy had been sung throughout and wanted to revive that ideal. Their answer was a solo voice declaiming the text freely over simple chords. The first operas appeared around 1600, and in 1607, in Mantua, Claudio Monteverdi staged L’Orfeo, the earliest opera still regularly performed.',
      'Beneath the voice lay the basso continuo: a bass line played by cello, bassoon or viol, with chords improvised on harpsichord, organ or lute from figures written in the score. This foundation supported almost all the music of the period, from opera to chamber music. At the same time the old modes gave way to the system of major and minor keys that still organises most Western music.',
      'In Italy, Arcangelo Corelli settled the concerto grosso, in which a small group of soloists answers the orchestra, and Antonio Vivaldi wrote hundreds of concertos for one soloist, many for the young women of the Ospedale della Pietà in Venice. His Four Seasons, published in 1725, set to music the sonnets printed with them: birdsong, a storm, the hunter.',
      'In France, Jean-Baptiste Lully ran the music of Louis XIV’s court and created French opera, closely tied to dance. In England, Henry Purcell wrote Dido and Aeneas. In Germany, Johann Sebastian Bach, organist and music director, drew all of this together. He wrote cantatas for Leipzig’s Sundays, the Passions, the Brandenburg Concertos and The Well-Tempered Clavier, a set of preludes and fugues in all twenty-four keys.',
      'George Frideric Handel, born the same year as Bach, made his career in London with Italian operas and then English oratorios such as Messiah, first performed in Dublin in 1742. Domenico Scarlatti, in Lisbon and Madrid, left hundreds of short harpsichord sonatas. By the time Bach died, his style already sounded old-fashioned to younger musicians, which is why that year conventionally marks the end of the Baroque.',
    ],
    sound:
      'Listen to the bass: it almost never stops and keeps a steady pulse, like an engine. Changes in volume come in blocks, from loud to soft, with no gradual swell. Each movement tends to hold a single mood from start to finish, joy, grief or triumph, and singers and players decorate the melody with ornaments.',
    changes: [
      {
        title: 'Opera is born',
        text: 'A solo voice declaims the drama over simple accompaniment. Within decades, opera becomes the costliest and most popular show in Europe.',
      },
      {
        title: 'The basso continuo holds everything up',
        text: 'A bass line with improvised chords gives the harmonic foundation of nearly all music of the period.',
      },
      {
        title: 'The key system settles in',
        text: 'Major and minor replace the old modes. Keys gain their own character and music begins to travel between them.',
      },
      {
        title: 'The violin takes the lead',
        text: 'The Cremona makers, Stradivari and Guarneri among them, build violins that remain the standard, and the concerto puts the instrument in front.',
      },
    ],
    forms: [
      {
        name: 'Opera',
        text: 'Sung drama, with recitatives that tell the story and arias that stop time for one emotion.',
      },
      {
        name: 'Oratorio and Passion',
        text: 'Sacred drama without staging, for choir, soloists and orchestra.',
      },
      {
        name: 'Cantata',
        text: 'A vocal piece in several movements. Bach wrote one for nearly every Sunday of the year in Leipzig.',
      },
      {
        name: 'Concerto',
        text: 'Soloist or small group against the orchestra, usually in three movements: fast, slow, fast.',
      },
      {
        name: 'Suite',
        text: 'A sequence of stylised dances: allemande, courante, sarabande and gigue.',
      },
      {
        name: 'Fugue',
        text: 'A short theme enters in each voice in turn and is worked out to the end of the piece.',
      },
    ],
    instruments: [
      'Violin',
      'Cello',
      'Viol',
      'Harpsichord',
      'Organ',
      'Baroque oboe',
      'Transverse flute',
      'Natural trumpet',
      'Timpani',
      'Theorbo',
    ],
    listenFirst: [
      {
        composer: 'Antonio Vivaldi',
        work: 'The Four Seasons: Spring',
        workId: '6878798a30e79c884ed67afa',
        note: 'Follow the birds in the solo violins and the thunder in the low strings.',
      },
      {
        composer: 'Johann Sebastian Bach',
        work: 'Prelude in C major, BWV 846',
        workId: '686d8556e3de9a37f27c507c',
        note: 'The first of The Well-Tempered Clavier. Nothing but broken chords, and it never tires.',
      },
      {
        composer: 'Johann Sebastian Bach',
        work: 'Brandenburg Concerto No. 3',
        workId: '686398f8204a67621b0c0c1b',
        note: 'Strings split into three groups that answer each other throughout.',
      },
      {
        composer: 'Henry Purcell',
        work: 'When I am laid in earth (Dido’s Lament)',
        workId: '686504c78f2800416032b20d',
        note: 'A descending bass line repeats under the whole aria.',
      },
      {
        composer: 'George Frideric Handel',
        work: 'Messiah: Hallelujah',
        workId: '686a915ac93ef3be836d8897',
        note: 'Choir and trumpets in celebration. The most sung piece in the choral repertoire.',
      },
    ],
    didYouKnow: [
      'At twenty, Bach walked about four hundred kilometres from Arnstadt to Lübeck to hear the organist Dieterich Buxtehude, and stayed months longer than his leave allowed.',
      'Vivaldi was a priest, nicknamed “il Prete Rosso,” the red priest, for the colour of his hair.',
      'The story goes that King George II stood during the Hallelujah at the London premiere of Messiah, and that audiences have stood ever since. No record confirms it.',
    ],
  },
  {
    key: 'classical',
    lede: 'Between 1750 and 1820, music aimed for clarity: tunes you can hum, balanced phrases and forms a listener can follow without effort. It was the time of Haydn, Mozart and the young Beethoven, in Vienna.',
    story: [
      'The generation after Bach wanted lighter, more direct music. His sons Carl Philipp Emanuel and Johann Christian helped replace the Baroque web of voices with a clear melody over accompaniment. In Mannheim, an orchestra famous for its discipline invented effects that thrilled audiences, such as the long crescendo, in which the sound grows little by little until it bursts.',
      'The Enlightenment ideal of reason and clarity reached music as sonata form: a movement that presents two contrasting themes, develops them and brings them back. This design organised symphonies, quartets, sonatas and concertos for more than a century. The basso continuo disappeared, and the orchestra settled into strings, paired woodwinds, horns, trumpets and timpani.',
      'Joseph Haydn spent almost thirty years serving the Esterházy family at an isolated palace in Hungary. With an orchestra at his disposal he tested ideas and ended up establishing the symphony and the string quartet as genres. When his employer died, he went to London and wrote the twelve London symphonies for packed concert halls.',
      'Wolfgang Amadeus Mozart toured Europe as a child prodigy and settled in Vienna in 1781, one of the first careers of a freelance musician with no permanent employer. He wrote in every genre: The Marriage of Figaro, Don Giovanni and The Magic Flute in opera, piano concertos with himself as soloist, symphonies, and the Requiem he left unfinished when he died at thirty-five.',
      'In these years music left palaces and churches for paid concerts and middle-class homes, where the piano replaced the harpsichord. Ludwig van Beethoven arrived in Vienna in 1792 to study with Haydn. His early works follow the classical models, but his Third Symphony, the Eroica of 1804, is already too long and dramatic to fit them. With him, music starts turning Romantic.',
    ],
    sound:
      'Notice the melody in front and the discreet accompaniment below, often a chord broken into repeated notes. Phrases come in pairs, a question and an answer of the same length. Volume now grows and fades gradually, and the mood can change within a single movement.',
    changes: [
      {
        title: 'Sonata form',
        text: 'Two themes, development and return. The design behind the first movement of almost every symphony, sonata and quartet.',
      },
      {
        title: 'The orchestra settles',
        text: 'No more continuo, woodwinds in pairs, and the clarinet arriving. The base of the modern symphony orchestra.',
      },
      {
        title: 'The piano replaces the harpsichord',
        text: 'It plays loud or soft depending on the touch, and becomes the instrument of home and concert hall.',
      },
      {
        title: 'The public concert',
        text: 'Paid tickets, halls open to the middle class, and musicians who live from audiences, not only patrons.',
      },
    ],
    forms: [
      {
        name: 'Symphony',
        text: 'An orchestral work in four movements, usually fast, slow, minuet and a quick finale.',
      },
      {
        name: 'String quartet',
        text: 'Two violins, viola and cello, talking as equals.',
      },
      {
        name: 'Piano sonata',
        text: 'Three or four movements, the first almost always in sonata form.',
      },
      {
        name: 'Piano concerto',
        text: 'Soloist and orchestra, with a cadenza in which the soloist plays alone and shows off.',
      },
      {
        name: 'Opera buffa',
        text: 'Sung comedy, with everyday characters and plenty of action on stage.',
      },
      {
        name: 'Theme and variations',
        text: 'A simple tune, repeated in ever-changing clothes.',
      },
    ],
    instruments: [
      'Fortepiano',
      'String quartet',
      'Clarinet',
      'Natural horn',
      'Flute',
      'Oboe',
      'Bassoon',
      'Classical orchestra',
    ],
    listenFirst: [
      {
        composer: 'Wolfgang Amadeus Mozart',
        work: 'Eine kleine Nachtmusik, K. 525',
        workId: '6865cc5ce541852612dfda61',
        note: 'A serenade for strings. Classical balance in its purest form.',
      },
      {
        composer: 'Joseph Haydn',
        work: 'Symphony No. 94, “Surprise”',
        workId: '687508dcfed73ac7cb1c035a',
        note: 'In the second movement, a quiet tune and then, suddenly, a very loud chord.',
      },
      {
        composer: 'Wolfgang Amadeus Mozart',
        work: 'Symphony No. 40, K. 550',
        workId: '6875030efed73ac7cb1c0211',
        note: 'One of the most famous opening themes in music. Notice the restlessness underneath.',
      },
      {
        composer: 'Wolfgang Amadeus Mozart',
        work: 'Clarinet Concerto, K. 622: Adagio',
        workId: '6864459e8f28004160328ccd',
        note: 'Written months before he died, for an instrument he helped bring into the orchestra.',
      },
      {
        composer: 'Ludwig van Beethoven',
        work: 'Piano Sonata No. 8, “Pathétique”',
        workId: '686c98703d4f77ce841eb684',
        note: 'Classical in form, with a fury that already points to Romanticism.',
      },
    ],
    didYouKnow: [
      'In his Symphony No. 45, the “Farewell,” Haydn had the musicians snuff out their candles and leave one by one at the end. It was a message to Prince Esterházy: the orchestra wanted to go home after too long a stay at the summer palace.',
      'At fourteen, in Rome, Mozart heard Allegri’s Miserere in the Sistine Chapel, a piece whose score was not allowed out, and wrote it down from memory afterwards. His father tells the story in a letter.',
      'The name “Surprise” is not Haydn’s. It came from the London audience, who loved the shock of the loud chord in the slow movement.',
    ],
  },
  {
    key: 'romantic',
    lede: 'In the nineteenth century, music began to speak for the individual: passion, nature, longing, homeland. Orchestras grew, the piano became the heart of the home and the virtuoso became a celebrity.',
    story: [
      'Beethoven opened the way. Deaf in his last years, he wrote ever more personal and expansive works, and in his Ninth Symphony of 1824 he brought a choir and soloists into the last movement to sing Schiller’s Ode to Joy. For the composers who followed, he was proof that music could say what words could not reach.',
      'In Vienna, Franz Schubert turned the song for voice and piano, the Lied, into a major art. He wrote more than six hundred, among them Erlkönig, in which one singer plays the narrator, the father, the sick child and the Elf King while the piano gallops without a break. Robert Schumann and Clara Schumann, one of the most admired pianists of her day, followed that path, as did Johannes Brahms, a close friend of the couple.',
      'The piano, now with an iron frame and a faster action, became the instrument of the century. Frédéric Chopin wrote almost only for it: nocturnes, ballades, études, and mazurkas and polonaises that carried memories of Poland to Paris. Franz Liszt invented the solo piano recital as we know it and stirred a frenzy that the poet Heinrich Heine called Lisztomania. Niccolò Paganini did the same with the violin.',
      'The orchestra grew in size and colour. In his Symphonie fantastique of 1830, Hector Berlioz told the story of an artist obsessed with a woman, with a theme that returns in every movement. In opera, Giuseppe Verdi gave Italy La traviata and Aida, and Richard Wagner built vast dramas such as The Ring of the Nibelung, in which each character and idea has its own musical motif. The chord that opens his Tristan und Isolde, from 1865, became famous for taking so long to resolve.',
      'Many composers looked to their own people’s music for a national voice: the Mighty Handful in Russia, Bedřich Smetana and Antonín Dvořák in Bohemia, Edvard Grieg in Norway. Pyotr Tchaikovsky wrote ballets that have never left the stage, such as The Nutcracker. In Brazil, Carlos Gomes premiered Il Guarany at La Scala in Milan in 1870, and the opera entered the repertoire of Italian theatres.',
    ],
    sound:
      'Listen for long melodies that breathe like singing, and richer harmony, full of passing notes and shifts of colour. Tempo stretches and tightens (rubato), volume ranges from near silence to a roar, and the orchestra adds brass and percussion to paint landscapes. Works tend to be either very short, one-minute piano pieces, or very long.',
    changes: [
      {
        title: 'Music tells stories',
        text: 'Symphonic poems and programme symphonies describe landscapes, legends and personal dramas.',
      },
      {
        title: 'The virtuoso becomes a star',
        text: 'Liszt and Paganini fill halls on their own. The recital is born, and with it the performer as celebrity.',
      },
      {
        title: 'The orchestra grows',
        text: 'More brass, valves on horns and trumpets, the tuba, the harp and new percussion. Some works call for more than a hundred players.',
      },
      {
        title: 'Each nation finds its voice',
        text: 'Local dances, songs and legends enter concert music, from Russia to Brazil.',
      },
    ],
    forms: [
      {
        name: 'Lied',
        text: 'A song for voice and piano on a poem, often gathered in cycles.',
      },
      {
        name: 'Character piece',
        text: 'A short piano work with a clear mood: nocturne, impromptu, intermezzo.',
      },
      {
        name: 'Symphonic poem',
        text: 'An orchestral work in one movement that narrates or depicts something outside music.',
      },
      {
        name: 'Music drama',
        text: 'Wagner’s opera: continuous music, no separate numbers, motifs for every idea.',
      },
      {
        name: 'Concert étude',
        text: 'A technical study that is also music for the stage, like those of Chopin and Liszt.',
      },
      {
        name: 'Ballet',
        text: 'Music for narrative dance, with Tchaikovsky as its great name.',
      },
    ],
    instruments: [
      'Modern piano',
      'Expanded orchestra',
      'Tuba',
      'Valve horn',
      'Pedal harp',
      'Piccolo',
      'Cor anglais',
      'Saxophone',
    ],
    listenFirst: [
      {
        composer: 'Franz Schubert',
        work: 'Erlkönig',
        workId: '6865f721e541852612dfe2e6',
        note: 'One singer, four characters. The piano is the galloping horse from start to finish.',
      },
      {
        composer: 'Frédéric Chopin',
        work: 'Nocturne Op. 9 No. 2',
        workId: '686b45924206d8332943ebfd',
        note: 'The melody sings like an opera voice over a gently rocking accompaniment.',
      },
      {
        composer: 'Ludwig van Beethoven',
        work: 'Symphony No. 9: finale',
        workId: '687508a1fed73ac7cb1c034f',
        note: 'The Ode to Joy tune first appears in the cellos and basses, without words, before the choir.',
      },
      {
        composer: 'Bedřich Smetana',
        work: 'Vltava (The Moldau)',
        workId: '6879344430e79c884ed68433',
        note: 'The river rises in two flutes and crosses Bohemia to Prague.',
      },
      {
        composer: 'Antonín Dvořák',
        work: 'Symphony No. 9, “From the New World”: Largo',
        workId: '687508bbfed73ac7cb1c0355',
        note: 'The cor anglais sings one of the best-known melodies in the repertoire.',
      },
    ],
    didYouKnow: [
      'Chopin asked for his heart to return to Poland after his death. His sister smuggled it from Paris to Warsaw, where it rests in a pillar of the Church of the Holy Cross.',
      'Heine coined Lisztomania in 1844 to describe Liszt’s audiences: fans who kept his cigar stubs and the broken strings of his piano.',
      'Carlos Gomes based Il Guarany on José de Alencar’s novel O Guarani, and its overture has opened the Brazilian government radio programme A Voz do Brasil for decades.',
    ],
  },
  {
    key: 'modern',
    lede: 'In the first half of the twentieth century, composers questioned rules that had seemed eternal: tonality, a steady beat, the usual orchestra. In a few years, Paris and Vienna heard more new things than in an entire century before.',
    story: [
      'Claude Debussy opened the door with the Prélude à l’après-midi d’un faune of 1894. The flute that begins the piece leads nowhere predictable: chords slide without resolving, and whole-tone scales blur any sense of a home key. People called it impressionism, a label Debussy hated. Maurice Ravel, in the same Paris, took orchestration to a watchmaker’s precision, which you can hear in his Boléro of 1928.',
      'On 29 May 1913, Igor Stravinsky’s The Rite of Spring opened at the Théâtre des Champs-Élysées with Nijinsky’s choreography. Rhythms that change every bar, chords hammered out with violence and the strange dancing provoked jeers and fights in the audience. A year earlier, in Berlin, the Viennese Arnold Schoenberg had premiered Pierrot lunaire, music with no key at all. Soon afterwards he devised twelve-tone composition, in which all twelve notes of the scale are arranged in a row. His pupils Alban Berg and Anton Webern formed, with him, the so-called Second Viennese School.',
      'Others looked for the new in the old and the popular. Béla Bartók travelled through villages in Hungary and Romania with a phonograph, recording peasants, and brought their rhythms and scales into concert music. Stravinsky and Sergei Prokofiev returned to eighteenth-century forms with modern eyes, the neoclassical style. George Gershwin joined jazz and orchestra in Rhapsody in Blue, in 1924.',
      'In Brazil, Heitor Villa-Lobos mixed Rio’s choro, Indigenous music and what he heard travelling the interior with European technique. In the Bachianas Brasileiras, written between 1930 and 1945, he brings Bach and Brazilian music together. The Aria from No. 5, for soprano and cellos, is one of the most performed Brazilian works in the world.',
      'Politics entered music. In the Soviet Union, Dmitri Shostakovich was attacked in 1936 by a Pravda editorial against his opera Lady Macbeth of Mtsensk, and spent his life balancing what he could say and what he wanted to say. In 1941, held in a German prison camp, Olivier Messiaen wrote the Quartet for the End of Time and premiered it for the prisoners. Meanwhile radio and records carried all this music to people who had never been to a concert hall.',
    ],
    sound:
      'Do not expect chords to resolve where older music would. In Debussy, listen to the colour of the chords more than their direction. In Stravinsky, feel the rhythm, which changes metre constantly and strikes like percussion. In Schoenberg, the melody leaps between distant notes and dissonance makes no apology. In Bartók and Villa-Lobos, listen for folk music behind the writing.',
    changes: [
      {
        title: 'Tonality loses its hold',
        text: 'Whole-tone scales, old modes, music with no home key and, with Schoenberg, the twelve-tone row.',
      },
      {
        title: 'Rhythm takes centre stage',
        text: 'Metres that change by the moment and irregular accents, as in The Rite of Spring.',
      },
      {
        title: 'Folk music and jazz enter the hall',
        text: 'Bartók records peasants, Villa-Lobos listens to choro, Gershwin brings the blues to the orchestra.',
      },
      {
        title: 'Recording changes who listens',
        text: 'Radio and records spread concert music. For the first time, people can hear the same performance again and again.',
      },
    ],
    forms: [
      {
        name: 'Ballet',
        text: 'Moves to the centre with Diaghilev’s Ballets Russes, which commission Stravinsky, Ravel and Prokofiev.',
      },
      {
        name: 'Serial music',
        text: 'Works built on a row of all twelve notes, none repeated before all have sounded.',
      },
      {
        name: 'Neoclassicism',
        text: 'Eighteenth-century forms, such as the concerto grosso and the suite, with modern harmony.',
      },
      {
        name: 'Chamber music for new groups',
        text: 'Unexpected line-ups, such as Pierrot lunaire’s, with a half-spoken, half-sung voice.',
      },
      {
        name: 'Film score',
        text: 'Sound film, from 1927, opens a new field for concert composers.',
      },
    ],
    instruments: [
      'Huge orchestra, then small ensembles',
      'Expanded percussion',
      'Celesta',
      'Xylophone',
      'Saxophone',
      'Percussive piano',
      'Ondes Martenot',
    ],
    listenFirst: [
      {
        composer: 'Claude Debussy',
        work: 'Clair de lune',
        workId: '68711dbfd4375027987dac04',
        note: 'For solo piano. The gentlest way into Debussy’s sound.',
      },
      {
        composer: 'Maurice Ravel',
        work: 'Boléro',
        workId: '68638e53204a67621b0c0a2b',
        note: 'One melody repeated for fifteen minutes, changing only its instruments and growing all the way.',
      },
      {
        composer: 'Igor Stravinsky',
        work: 'The Rite of Spring: Augurs of Spring',
        workId: '6875c17fabb1ea4be867dd7b',
        note: 'The same chord hammered with accents you cannot predict.',
      },
      {
        composer: 'Heitor Villa-Lobos',
        work: 'Bachianas Brasileiras No. 5: Aria',
        workId: '68633e1a204a67621b0bfa15',
        note: 'Soprano and eight cellos. The wordless melody at the start stays with you.',
      },
      {
        composer: 'Sergei Prokofiev',
        work: 'Peter and the Wolf',
        workId: '686c2ca86df8a20650ffce73',
        note: 'A story for children in which each character is an instrument.',
      },
    ],
    didYouKnow: [
      'At the premiere of The Rite, the noise in the audience was so loud that the dancers could not hear the orchestra. Nijinsky stood on a chair in the wings, shouting out the counts.',
      'The Quartet for the End of Time was written for the instruments available in the camp: violin, cello, clarinet and an old piano. It was first played in January 1941, for hundreds of prisoners and guards, in a freezing hut.',
      'In Peter and the Wolf, the bird is the flute, the duck the oboe, the cat the clarinet, the grandfather the bassoon, the wolf three horns and Peter the strings.',
    ],
  },
  {
    key: 'contemporary',
    lede: 'After 1950, each composer began choosing a language of their own. Silence, noise, computers, hypnotic repetition and the return of melody live side by side, and concert music talks with film, video games and popular music.',
    story: [
      'Right after the war, in Darmstadt, Germany, young composers such as Pierre Boulez and Karlheinz Stockhausen pushed Schoenberg’s idea of the row to the limit, organising not only the notes but also durations, dynamics and timbres. At the same time, in Paris, Pierre Schaeffer recorded sounds from the world, trains, saucepans, voices, and edited them on tape: musique concrète, in 1948. In Cologne, a radio studio produced the first pieces made entirely from electronic sounds.',
      'Across the Atlantic, John Cage went another way and let chance decide. He used coins and the I Ching to compose, wedged screws and rubber between the piano strings, the prepared piano, and in 1952 presented 4’33”, in which the pianist plays nothing for four minutes and thirty-three seconds. The piece is made of the sounds of the room and the people in it.',
      'In the 1960s, György Ligeti wrote pieces such as Atmosphères, in which dozens of instruments play neighbouring notes at once, and the result is a cloud of sound that changes slowly. Stanley Kubrick used this music in 2001: A Space Odyssey. Krzysztof Penderecki composed Threnody to the Victims of Hiroshima with strings that scrape and scream.',
      'In reaction to so much complexity, minimalism appeared in the United States. Terry Riley, Steve Reich and Philip Glass wrote music made of short patterns repeated for a long time, changing little by little. In Estonia, Arvo Pärt created a style of very few notes, tintinnabuli, that sounds both ancient and new. This music drew in listeners who had drifted away from contemporary music.',
      'Today concert music lives alongside film, video games and pop. John Williams writes scores that orchestras around the world play in concert. Composers such as Kaija Saariaho and Caroline Shaw, who won the Pulitzer Prize in 2013 for Partita for 8 Voices, have widened what voices and orchestras can do. In Brazil, the Música Nova group led by Gilberto Mendes, and composers such as Almeida Prado and Marlos Nobre, built bridges between the avant-garde and Brazilian roots.',
    ],
    sound:
      'Here the useful question is “what is this composer exploring?” It might be a single chord transforming slowly, a pattern repeated until it becomes a trance, recorded sounds from the world, silence, or a simple melody returning after decades of abstraction. Listen without expecting a familiar form, and pay attention to texture and time.',
    changes: [
      {
        title: 'Electronic sound',
        text: 'Tape, synthesizer and computer become instruments. Any sound can be musical material.',
      },
      {
        title: 'Chance and silence',
        text: 'Cage lets coins and the room decide. The score starts proposing paths instead of fixing everything.',
      },
      {
        title: 'Repetition returns',
        text: 'Minimalism builds long works from short patterns and brings audiences back to new music.',
      },
      {
        title: 'Borders dissolve',
        text: 'Concert music, film, games, jazz and pop mix, and orchestras play film scores to full houses.',
      },
    ],
    forms: [
      {
        name: 'Electroacoustic music',
        text: 'Recorded or synthesized sounds, alone or with live instruments.',
      },
      {
        name: 'Open work',
        text: 'A score with choices left to the performer or to chance.',
      },
      {
        name: 'Minimalism',
        text: 'Short patterns that repeat and change slowly, creating a sense of trance.',
      },
      {
        name: 'Sound mass',
        text: 'Textures in which many close notes sound together, as in Ligeti’s works.',
      },
      {
        name: 'Contemporary opera',
        text: 'Dramas on current subjects, such as Einstein on the Beach or Nixon in China.',
      },
      {
        name: 'Film and game scores',
        text: 'Orchestral music written for the screen, now filling concert halls.',
      },
    ],
    instruments: [
      'Synthesizer',
      'Magnetic tape',
      'Computer',
      'Prepared piano',
      'Extended techniques',
      'Voice with new techniques',
      'Percussion from around the world',
    ],
    listenFirst: [
      {
        composer: 'Arvo Pärt',
        work: 'Spiegel im Spiegel',
        note: 'Violin or cello and piano, very few notes. Calm from the first bar to the last.',
      },
      {
        composer: 'Steve Reich',
        work: 'Music for 18 Musicians',
        composerId: '685f2686c6bd886c5b49878c',
        note: 'Pulses that repeat and transform for almost an hour. Let it carry you.',
      },
      {
        composer: 'Philip Glass',
        work: 'Metamorphosis One',
        composerId: '685e669fc6bd886c5b496a4a',
        note: 'Solo piano, repetition and a melancholy that wins you over on first hearing.',
      },
      {
        composer: 'György Ligeti',
        work: 'Atmosphères',
        composerId: '685ec5f0c6bd886c5b4978fb',
        note: 'A cloud of sound that changes colour. The same one heard in 2001: A Space Odyssey.',
      },
      {
        composer: 'John Adams',
        work: 'Short Ride in a Fast Machine',
        note: 'Four minutes of orchestra at full speed, with a woodblock keeping the pulse.',
      },
    ],
    didYouKnow: [
      'At the premiere of 4’33” in 1952, the pianist David Tudor closed and opened the keyboard lid to mark the three movements, timing them with a stopwatch.',
      'In a church in Halberstadt, Germany, an organ has been playing a Cage piece called ORGAN²/ASLSP since 2001. The performance is scheduled to end in 2640, and each chord change draws visitors.',
      'Kubrick used Ligeti’s music in 2001 without asking permission. The composer only found out when he saw the film, and took the studio to court.',
    ],
  },
];

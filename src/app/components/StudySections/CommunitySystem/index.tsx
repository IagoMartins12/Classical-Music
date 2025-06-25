import React, { useState, useEffect } from 'react';
import {
  FiUsers,
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiPlay,
  FiMusic,
  FiStar,
  FiCalendar,
  FiMapPin,
  FiSearch,
  FiFilter,
  FiPlus,
  FiSettings,
  FiFlag,
  FiMoreHorizontal,
  FiEye,
  FiClock,
  FiThumbsUp,
  FiThumbsDown,
  FiBookmark,
  FiSend,
  FiImage,
  FiVideo,
  FiMic,
  FiUpload,
  FiDownload,
  FiEdit3,
  FiTrash2,
  FiUserPlus,
  FiUserCheck,
  FiGlobe,
  FiLock,
  FiZap,
  FiTarget,
  FiUser,
  FiActivity,
  FiX,
} from 'react-icons/fi';
import {
  GiPianoKeys,
  GiViolin,
  GiTrumpet,
  GiGuitar,
  GiDrumKit,
} from 'react-icons/gi';

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  instruments: string[];
  location?: string;
  verified: boolean;
  followers: number;
  following: number;
  practiceStreak: number;
  totalPracticeTime: number;
  achievements: string[];
  joinedAt: string;
  isFollowing?: boolean;
  isOnline?: boolean;
}

interface Post {
  id: string;
  author: User;
  type: 'text' | 'audio' | 'video' | 'sheet_music' | 'progress' | 'achievement';
  content: string;
  media?: {
    type: 'audio' | 'video' | 'image';
    url: string;
    thumbnail?: string;
    duration?: number;
  };
  metadata?: {
    piece?: string;
    composer?: string;
    instrument?: string;
    difficulty?: number;
    tempo?: number;
    key?: string;
  };
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
  createdAt: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  tags: string[];
  visibility: 'public' | 'followers' | 'private';
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  creator: User;
  type:
    | 'technique'
    | 'piece'
    | 'improvisation'
    | 'sight_reading'
    | 'composition';
  difficulty: 'easy' | 'medium' | 'hard';
  instrument?: string;
  duration: number; // dias
  participants: number;
  prizes?: string[];
  rules: string[];
  deadline: string;
  startDate: string;
  tags: string[];
  isParticipating?: boolean;
  submissions?: number;
}

interface Group {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  type: 'instrument' | 'genre' | 'level' | 'location' | 'general';
  privacy: 'public' | 'private' | 'invite_only';
  members: number;
  admins: User[];
  moderators: User[];
  createdAt: string;
  isJoined?: boolean;
  recentActivity: number;
  tags: string[];
}

const CommunitySystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'feed' | 'challenges' | 'groups' | 'discover' | 'profile'
  >('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dados simulados
  useEffect(() => {
    // Simular carregamento de dados
    setPosts([
      {
        id: '1',
        author: {
          id: '1',
          name: 'Ana Silva',
          username: '@ana_piano',
          avatar: '/api/placeholder/40/40',
          level: 'advanced',
          instruments: ['Piano'],
          verified: true,
          followers: 1200,
          following: 340,
          practiceStreak: 25,
          totalPracticeTime: 4500,
          achievements: ['Sequência de 30 dias', 'Mestre do Piano'],
          joinedAt: '2023-01-15',
          isOnline: true,
        },
        type: 'audio',
        content:
          'Acabei de terminar minha interpretação de Chopin Op. 9 No. 2. Que acham? Feedback é sempre bem-vindo! 🎹',
        media: {
          type: 'audio',
          url: '/api/placeholder/audio',
          duration: 285,
        },
        metadata: {
          piece: 'Nocturne Op. 9 No. 2',
          composer: 'Chopin',
          instrument: 'Piano',
          difficulty: 7,
          tempo: 120,
          key: 'Eb Major',
        },
        likes: 47,
        comments: 12,
        shares: 5,
        bookmarks: 8,
        createdAt: '2024-06-24T10:30:00Z',
        isLiked: false,
        isBookmarked: true,
        tags: ['chopin', 'piano', 'romantic', 'nocturne'],
        visibility: 'public',
      },
      {
        id: '2',
        author: {
          id: '2',
          name: 'Carlos Mendes',
          username: '@carlos_violin',
          avatar: '/api/placeholder/40/40',
          level: 'intermediate',
          instruments: ['Violino'],
          verified: false,
          followers: 340,
          following: 180,
          practiceStreak: 12,
          totalPracticeTime: 2100,
          achievements: ['Primeira Performance', 'Estudante Dedicado'],
          joinedAt: '2023-08-20',
          isOnline: false,
        },
        type: 'progress',
        content:
          'Depois de 2 meses praticando, finalmente consegui tocar as escalas em todas as posições! O progresso é lento mas consistente. 💪',
        likes: 23,
        comments: 8,
        shares: 2,
        bookmarks: 3,
        createdAt: '2024-06-24T08:15:00Z',
        isLiked: true,
        tags: ['progresso', 'violino', 'escalas', 'técnica'],
        visibility: 'public',
      },
      {
        id: '3',
        author: {
          id: '3',
          name: 'Marina Santos',
          username: '@marina_flute',
          avatar: '/api/placeholder/40/40',
          level: 'professional',
          instruments: ['Flauta', 'Piccolo'],
          verified: true,
          followers: 2800,
          following: 150,
          practiceStreak: 45,
          totalPracticeTime: 8900,
          achievements: [
            'Profissional Certificado',
            'Mestre da Flauta',
            'Influencer Musical',
          ],
          joinedAt: '2022-05-10',
          isOnline: true,
        },
        type: 'video',
        content:
          'Masterclass gratuita: Técnicas avançadas de respiração para instrumentos de sopro. Quem tem interesse? 🎵',
        media: {
          type: 'video',
          url: '/api/placeholder/video',
          thumbnail: '/api/placeholder/300/200',
          duration: 1800,
        },
        metadata: {
          instrument: 'Flauta',
          difficulty: 8,
        },
        likes: 156,
        comments: 34,
        shares: 28,
        bookmarks: 67,
        createdAt: '2024-06-23T16:45:00Z',
        isLiked: true,
        isBookmarked: false,
        tags: ['masterclass', 'flauta', 'técnica', 'respiração'],
        visibility: 'public',
      },
    ]);

    setChallenges([
      {
        id: '1',
        title: 'Desafio Bach 30 Dias',
        description:
          'Aprenda uma invenção de Bach em 30 dias. Escolha qualquer invenção a 2 vozes e compartilhe seu progresso!',
        creator: {
          id: '4',
          name: 'Prof. Eduardo Bach',
          username: '@prof_eduardo',
          level: 'professional',
          instruments: ['Piano', 'Cravo'],
          verified: true,
          followers: 5600,
          following: 200,
          practiceStreak: 150,
          totalPracticeTime: 15000,
          achievements: ['Mestre do Barroco'],
          joinedAt: '2021-03-15',
        },
        type: 'piece',
        difficulty: 'medium',
        instrument: 'Piano',
        duration: 30,
        participants: 234,
        prizes: [
          'Masterclass gratuita',
          'Partituras exclusivas',
          'Certificado de participação',
        ],
        rules: [
          'Escolha qualquer Invenção a 2 vozes de Bach',
          'Poste um vídeo inicial e um final',
          'Compartilhe pelo menos 3 updates de progresso',
          'Use as hashtags #BachChallenge30',
        ],
        deadline: '2024-07-24T23:59:59Z',
        startDate: '2024-06-24T00:00:00Z',
        tags: ['bach', 'piano', 'barroco', 'invenção'],
        isParticipating: true,
        submissions: 89,
      },
      {
        id: '2',
        title: 'Improvisação Jazz Semanal',
        description:
          'Toda semana um novo standard de jazz para improvisar. Esta semana: "Autumn Leaves"',
        creator: {
          id: '5',
          name: 'Sarah Jazz',
          username: '@sarah_jazz',
          level: 'professional',
          instruments: ['Piano', 'Teclado'],
          verified: true,
          followers: 3200,
          following: 890,
          practiceStreak: 78,
          totalPracticeTime: 12000,
          achievements: ['Jazz Master', 'Improvisação Expert'],
          joinedAt: '2022-01-20',
        },
        type: 'improvisation',
        difficulty: 'hard',
        duration: 7,
        participants: 156,
        rules: [
          'Improvise sobre o standard da semana',
          'Mínimo 2 choruses',
          'Pode usar qualquer instrumento',
          'Criatividade é o limite!',
        ],
        deadline: '2024-06-30T23:59:59Z',
        startDate: '2024-06-24T00:00:00Z',
        tags: ['jazz', 'improvisação', 'standards'],
        isParticipating: false,
        submissions: 23,
      },
    ]);

    setGroups([
      {
        id: '1',
        name: 'Pianistas Brasileiros',
        description:
          'Comunidade para pianistas do Brasil compartilharem experiências, dicas e performances',
        avatar: '/api/placeholder/60/60',
        type: 'instrument',
        privacy: 'public',
        members: 1247,
        admins: [],
        moderators: [],
        createdAt: '2023-01-15',
        isJoined: true,
        recentActivity: 45,
        tags: ['piano', 'brasil', 'clássico', 'popular'],
      },
      {
        id: '2',
        name: 'Iniciantes Unidos',
        description:
          'Grupo de apoio para músicos iniciantes. Sem julgamentos, só apoio e crescimento!',
        avatar: '/api/placeholder/60/60',
        type: 'level',
        privacy: 'public',
        members: 892,
        admins: [],
        moderators: [],
        createdAt: '2023-03-10',
        isJoined: false,
        recentActivity: 23,
        tags: ['iniciante', 'apoio', 'aprendizado'],
      },
      {
        id: '3',
        name: 'Jazz Moderno',
        description:
          'Discussões sobre jazz contemporâneo, fusion e técnicas modernas',
        avatar: '/api/placeholder/60/60',
        type: 'genre',
        privacy: 'public',
        members: 567,
        admins: [],
        moderators: [],
        createdAt: '2022-11-20',
        isJoined: true,
        recentActivity: 67,
        tags: ['jazz', 'moderno', 'fusion', 'contemporâneo'],
      },
    ]);
  }, []);

  // Componente de post
  const PostCard: React.FC<{ post: Post }> = ({ post }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showComments, setShowComments] = useState(false);

    const getInstrumentIcon = (instrument: string) => {
      const icons = {
        Piano: GiPianoKeys,
        Violino: GiViolin,
        Flauta: FiMusic,
        Trompete: GiTrumpet,
        Guitarra: GiGuitar,
        Bateria: GiDrumKit,
      };
      const Icon = icons[instrument as keyof typeof icons] || FiMusic;
      return <Icon className="w-4 h-4" />;
    };

    const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <div className="bg-white/5 rounded-xl border border-white/20 overflow-hidden">
        {/* Header do post */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {post.author.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900"></div>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-white">
                    {post.author.name}
                  </span>
                  {post.author.verified && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <FiStar className="w-2 h-2 text-white" />
                    </div>
                  )}
                  <span className="text-sm text-gray-400">
                    {post.author.username}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    {getInstrumentIcon(post.author.instruments[0])}
                    <span>{post.author.instruments[0]}</span>
                  </div>
                  <span>•</span>
                  <span className="capitalize">{post.author.level}</span>
                </div>
              </div>
            </div>
            <button className="w-8 h-8 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center text-gray-400">
              <FiMoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-4">
          <p className="text-white mb-3">
            {isExpanded ? post.content : post.content.slice(0, 200)}
            {post.content.length > 200 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-400 hover:text-blue-300 ml-2"
              >
                {isExpanded ? 'ver menos' : '...ver mais'}
              </button>
            )}
          </p>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Metadata da peça */}
          {post.metadata && (
            <div className="bg-white/5 rounded-lg p-3 mb-3 border border-white/10">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {post.metadata.piece && (
                  <div className="flex items-center space-x-2">
                    <FiMusic className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">Peça:</span>
                    <span className="text-white">{post.metadata.piece}</span>
                  </div>
                )}
                {post.metadata.composer && (
                  <div className="flex items-center space-x-2">
                    <FiUser className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300">Compositor:</span>
                    <span className="text-white">{post.metadata.composer}</span>
                  </div>
                )}
                {post.metadata.difficulty && (
                  <div className="flex items-center space-x-2">
                    <FiTarget className="w-4 h-4 text-orange-400" />
                    <span className="text-gray-300">Dificuldade:</span>
                    <span className="text-white">
                      {post.metadata.difficulty}/10
                    </span>
                  </div>
                )}
                {post.metadata.tempo && (
                  <div className="flex items-center space-x-2">
                    <FiClock className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Tempo:</span>
                    <span className="text-white">
                      {post.metadata.tempo} BPM
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mídia */}
          {post.media && (
            <div className="mb-4 rounded-lg overflow-hidden bg-white/5 border border-white/10">
              {post.media.type === 'audio' && (
                <div className="p-4 flex items-center space-x-4">
                  <button className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center text-white">
                    <FiPlay className="w-5 h-5 ml-1" />
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">
                        Gravação de Áudio
                      </span>
                      <span className="text-gray-400 text-sm">
                        {formatDuration(post.media.duration || 0)}
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: '0%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {post.media.type === 'video' && (
                <div className="relative">
                  <img
                    src={post.media.thumbnail}
                    alt="Video thumbnail"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="w-16 h-16 rounded-full bg-black/70 hover:bg-black/80 transition-colors flex items-center justify-center text-white">
                      <FiPlay className="w-6 h-6 ml-1" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(post.media.duration || 0)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ações do post */}
        <div className="border-t border-white/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                className={`flex items-center space-x-2 transition-colors ${
                  post.isLiked
                    ? 'text-red-400'
                    : 'text-gray-400 hover:text-red-400'
                }`}
              >
                <FiHeart
                  className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`}
                />
                <span className="text-sm">{post.likes}</span>
              </button>

              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors"
              >
                <FiMessageCircle className="w-5 h-5" />
                <span className="text-sm">{post.comments}</span>
              </button>

              <button className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors">
                <FiShare2 className="w-5 h-5" />
                <span className="text-sm">{post.shares}</span>
              </button>

              <button
                className={`transition-colors ${
                  post.isBookmarked
                    ? 'text-yellow-400'
                    : 'text-gray-400 hover:text-yellow-400'
                }`}
              >
                <FiBookmark
                  className={`w-5 h-5 ${
                    post.isBookmarked ? 'fill-current' : ''
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center space-x-2 text-gray-400 text-xs">
              <FiEye className="w-4 h-4" />
              <span>
                {(post.likes + post.comments + post.shares) * 3} visualizações
              </span>
            </div>
          </div>

          {/* Comentários */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="space-y-3">
                <div className="flex space-x-3">
                  <img
                    src="/api/placeholder/32/32"
                    alt="User"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="bg-white/5 rounded-lg px-3 py-2">
                      <div className="text-sm text-white">
                        <span className="font-medium">João Silva:</span>{' '}
                        Excelente interpretação! A dinâmica está perfeita.
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>2h</span>
                      <button className="hover:text-white transition-colors">
                        Curtir
                      </button>
                      <button className="hover:text-white transition-colors">
                        Responder
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <img
                    src="/api/placeholder/32/32"
                    alt="User"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 flex space-x-2">
                    <input
                      type="text"
                      placeholder="Escreva um comentário..."
                      className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 text-sm"
                    />
                    <button className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center justify-center text-white transition-colors">
                      <FiSend className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Componente de desafio
  const ChallengeCard: React.FC<{ challenge: Challenge }> = ({ challenge }) => {
    const daysLeft = Math.ceil(
      (new Date(challenge.deadline).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    );

    return (
      <div className="bg-white/5 rounded-xl border border-white/20 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              {challenge.title}
            </h3>
            <p className="text-gray-300 text-sm mb-3">
              {challenge.description}
            </p>

            <div className="flex items-center space-x-4 mb-3">
              <div className="flex items-center space-x-2">
                <FiUsers className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">
                  {challenge.participants} participantes
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <FiClock className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-gray-300">
                  {daysLeft} dias restantes
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <FiTarget className="w-4 h-4 text-purple-400" />
                <span
                  className={`text-sm px-2 py-1 rounded ${
                    challenge.difficulty === 'easy'
                      ? 'bg-green-500/20 text-green-400'
                      : challenge.difficulty === 'medium'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {challenge.difficulty}
                </span>
              </div>
            </div>

            {challenge.prizes && challenge.prizes.length > 0 && (
              <div className="mb-3">
                <div className="text-sm text-gray-400 mb-1">Prêmios:</div>
                <div className="flex flex-wrap gap-1">
                  {challenge.prizes.map((prize, index) => (
                    <span
                      key={index}
                      className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded"
                    >
                      🏆 {prize}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src={challenge.creator.avatar}
              alt={challenge.creator.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-sm text-gray-400">
              Por {challenge.creator.name}
            </span>
          </div>

          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              challenge.isParticipating
                ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {challenge.isParticipating ? 'Participando' : 'Participar'}
          </button>
        </div>
      </div>
    );
  };

  // Componente de grupo
  const GroupCard: React.FC<{ group: Group }> = ({ group }) => {
    return (
      <div className="bg-white/5 rounded-xl border border-white/20 p-6">
        <div className="flex items-start space-x-4">
          <img
            src={group.avatar}
            alt={group.name}
            className="w-12 h-12 rounded-full object-cover"
          />

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">{group.name}</h3>
              <div className="flex items-center space-x-2">
                {group.privacy === 'private' && (
                  <FiLock className="w-4 h-4 text-gray-400" />
                )}
                {group.privacy === 'public' && (
                  <FiGlobe className="w-4 h-4 text-green-400" />
                )}
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-3">{group.description}</p>

            <div className="flex items-center space-x-4 mb-3 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <FiUsers className="w-4 h-4" />
                <span>{group.members} membros</span>
              </div>

              <div className="flex items-center space-x-1">
                <FiActivity className="w-4 h-4" />
                <span>{group.recentActivity} posts hoje</span>
              </div>

              <span className="capitalize px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                {group.type}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {group.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-white/10 text-gray-400 px-2 py-1 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  group.isJoined
                    ? 'bg-gray-500/20 text-gray-400 border border-gray-500/40'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {group.isJoined ? 'Membro' : 'Participar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <FiUsers className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">
                Comunidade Musical
              </h1>
            </div>

            {/* Navegação */}
            <nav className="flex space-x-2">
              {[
                { id: 'feed', label: 'Feed', icon: FiActivity },
                { id: 'challenges', label: 'Desafios', icon: FiTarget },
                { id: 'groups', label: 'Grupos', icon: FiUsers },
                { id: 'discover', label: 'Descobrir', icon: FiSearch },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 w-64"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <button
              onClick={() => setShowCreatePost(true)}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              <span>Criar Post</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-6xl mx-auto p-6">
        {activeTab === 'feed' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Feed principal */}
            <div className="lg:col-span-3 space-y-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Usuários sugeridos */}
              <div className="bg-white/5 rounded-xl border border-white/20 p-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Sugestões para Seguir
                </h3>
                <div className="space-y-3">
                  {users.slice(0, 3).map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-white text-sm font-medium">
                            {user.name}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {user.instruments[0]}
                          </div>
                        </div>
                      </div>
                      <button className="text-blue-400 hover:text-blue-300 text-sm">
                        Seguir
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desafios em destaque */}
              <div className="bg-white/5 rounded-xl border border-white/20 p-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Desafios em Destaque
                </h3>
                <div className="space-y-3">
                  {challenges.slice(0, 2).map((challenge) => (
                    <div
                      key={challenge.id}
                      className="border border-white/10 rounded-lg p-3"
                    >
                      <h4 className="text-white text-sm font-medium mb-1">
                        {challenge.title}
                      </h4>
                      <div className="text-gray-400 text-xs mb-2">
                        {challenge.participants} participantes
                      </div>
                      <button className="text-blue-400 hover:text-blue-300 text-xs">
                        Ver mais
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Desafios Musicais
              </h2>
              <button className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors">
                <FiPlus className="w-4 h-4" />
                <span>Criar Desafio</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {challenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Grupos Musicais</h2>
              <button className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                <FiPlus className="w-4 h-4" />
                <span>Criar Grupo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'discover' && (
          <div className="text-center py-20">
            <FiSearch className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Descobrir Músicos
            </h3>
            <p className="text-gray-400">
              Encontre outros músicos por instrumento, localização ou nível
            </p>
          </div>
        )}
      </div>

      {/* Modal de criar post */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl border border-white/20 p-6 max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Criar Post</h3>
              <button
                onClick={() => setShowCreatePost(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center text-gray-400"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <textarea
                placeholder="O que você está praticando hoje?"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-3 text-white placeholder-gray-400 resize-none h-24"
              />

              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-2 text-white text-sm transition-colors">
                  <FiImage className="w-4 h-4" />
                  <span>Foto</span>
                </button>

                <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-2 text-white text-sm transition-colors">
                  <FiMic className="w-4 h-4" />
                  <span>Áudio</span>
                </button>

                <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-2 text-white text-sm transition-colors">
                  <FiVideo className="w-4 h-4" />
                  <span>Vídeo</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <select className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm">
                  <option value="public">🌍 Público</option>
                  <option value="followers">👥 Seguidores</option>
                  <option value="private">🔒 Privado</option>
                </select>

                <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
                  Publicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunitySystem;

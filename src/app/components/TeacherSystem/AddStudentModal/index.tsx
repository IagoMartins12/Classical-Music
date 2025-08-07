import { FiMapPin, FiPlus, FiSearch, FiUser, FiUserPlus } from 'react-icons/fi';
import { AnimatedCard } from '../../animation/AnimatedComponents';
import Input from '../../Common/Inputs';
import Modal from '../../Modal';
import Image from 'next/image';
import { StudentSearchResult } from '@/app/(teacher)/teacher/pageClient';
import { Dispatch, SetStateAction } from 'react';

interface AddStudentModalProps {
  onClose: () => void;
  isOpen: boolean;
  searchLoading: boolean;
  searchResults: StudentSearchResult[];
  searchQuery: string;
  loading: boolean;
  addStudent: (studentUserId: string) => Promise<void>;
  handleSearchChange?: (value: string) => () => void;
  setSearchQuery?: Dispatch<SetStateAction<string>>;
}
const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  searchLoading,
  searchQuery,
  searchResults,
  loading,
  addStudent,
  handleSearchChange,
  setSearchQuery,
}) => {
  return (
    <Modal maxWidth="3xl" isOpen={isOpen} onClose={onClose}>
      <AnimatedCard hover="none">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-theme-primary classical-title">
                Adicionar Novo Aluno
              </h2>
              <p className="text-theme-tertiary">
                Busque o aluno pelo email completo
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative mb-6">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4" />
            <Input
              type="email"
              placeholder="Digite o email completo do aluno..."
              value={searchQuery}
              onChange={(e) => {
                if (setSearchQuery) {
                  setSearchQuery(e.target.value);
                } else if (handleSearchChange) {
                  handleSearchChange(e.target.value);
                }
              }}
              className="input-classical w-full"
            />
            {searchLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-theme-primary">
                Resultados da busca ({searchResults.length})
              </h3>

              {searchResults.map((student) => (
                <div key={student.id} className="classical-card-simple p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Avatar */}
                      <div className="relative w-10 h-10">
                        {student.image ? (
                          <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-brand-primary/20">
                            <Image
                              src={student.image}
                              alt={student.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center border-2 border-brand-primary/20">
                            <FiUser className="w-5 h-5 text-theme-primary" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="font-semibold text-theme-primary">
                          {student.name}
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          {student.email}
                        </div>
                        {student.location && (
                          <div className="text-xs text-theme-tertiary flex items-center">
                            <FiMapPin className="w-3 h-3 mr-1" />
                            {student.location}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div>
                      {student.isAlreadyStudent ? (
                        <span className="px-3 py-1 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded-full text-xs font-medium">
                          Já é seu aluno
                        </span>
                      ) : (
                        <button
                          onClick={() => addStudent(student.id)}
                          disabled={loading}
                          className="btn-classical-primary text-sm px-4 py-2 flex items-center space-x-2"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-theme-primary/30 border-t-theme-primary rounded-full animate-spin"></div>
                              <span>Adicionando...</span>
                            </>
                          ) : (
                            <>
                              <FiPlus className="w-4 h-4" />
                              <span>Adicionar</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {searchQuery.length >= 3 &&
            searchResults.length === 0 &&
            !searchLoading && (
              <div className="text-center py-8">
                <FiSearch className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                <h3 className="font-semibold text-theme-primary mb-2">
                  Nenhum aluno encontrado
                </h3>
                <p className="text-theme-tertiary text-sm">
                  Verifique se o email está correto ou se o usuário já se
                  cadastrou na plataforma.
                </p>
              </div>
            )}

          {/* Instructions */}
          {searchQuery.length < 3 && (
            <div className="text-center py-8">
              <FiUserPlus className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
              <h3 className="font-semibold text-theme-primary mb-2">
                Como adicionar um aluno
              </h3>
              <div className="text-theme-tertiary text-sm space-y-2">
                <p>1. Digite o email completo do aluno no campo acima</p>
                <p>2. O aluno deve estar cadastrado na plataforma</p>
                <p>3. Clique em "Adicionar" quando encontrar o aluno</p>
              </div>
            </div>
          )}
        </div>
      </AnimatedCard>
    </Modal>
  );
};

export default AddStudentModal;

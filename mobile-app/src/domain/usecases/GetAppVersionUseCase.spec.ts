import { GetAppVersionUseCase } from './GetAppVersionUseCase';
import { AppVersionRepository } from '../repositories/AppVersionRepository';

describe('GetAppVersionUseCase', () => {
    it('should return version from repository', () => {
        const mockRepo: AppVersionRepository = {
            getVersion: jest.fn().mockReturnValue('1.0.0'),
        };

        const useCase = new GetAppVersionUseCase(mockRepo);
        expect(useCase.execute()).toBe('1.0.0');
        expect(mockRepo.getVersion).toHaveBeenCalled();
    });
});

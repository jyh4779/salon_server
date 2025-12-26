import { AppVersionRepository } from '../repositories/AppVersionRepository';

export class GetAppVersionUseCase {
    constructor(private readonly repository: AppVersionRepository) { }

    execute(): string {
        return this.repository.getVersion();
    }
}

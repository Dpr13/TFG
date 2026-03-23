import { searchedAssetsRepository, SearchedAssetDTO } from '../repositories/searchedAssets.repository';
import { Asset } from '../models/asset';

export class SearchedAssetsService {
  static async getUserSearchedAssets(userId: string): Promise<Asset[]> {
    return await searchedAssetsRepository.getUserSearchedAssets(userId);
  }

  static async addSearchedAsset(userId: string, data: SearchedAssetDTO): Promise<Asset> {
    return await searchedAssetsRepository.addSearchedAsset(userId, data);
  }

  static async removeSearchedAsset(userId: string, assetSymbol: string): Promise<boolean> {
    return await searchedAssetsRepository.removeSearchedAsset(userId, assetSymbol);
  }

  static async isSearched(userId: string, assetSymbol: string): Promise<boolean> {
    return await searchedAssetsRepository.isSearched(userId, assetSymbol);
  }
}

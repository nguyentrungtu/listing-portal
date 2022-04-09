import { Injectable } from '@angular/core';
import { Listing, SearchCriteria } from './listing-search.data';
import { Firestore, CollectionReference, DocumentData, Query, query, where, collection, orderBy, DocumentSnapshot, limit } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { BehaviorSubject } from 'rxjs';
import { FirestoreCollections } from 'src/app/shared/globals';
import { getDocs } from '@firebase/firestore';

@Injectable({ providedIn: 'any' })
export class ListingSearchService {
    private searchResults$$ = new BehaviorSubject<Listing[]>([]);
    private searchResults$ = this.searchResults$$.asObservable();

    private searchInProgress$$ = new BehaviorSubject<boolean>(false);
    private searchInProgress$ = this.searchInProgress$$.asObservable();

    paginationLimit: number = 6;
    lastResultOfCurrentPagination!: DocumentSnapshot;

    constructor(private firestore: Firestore, private storage: Storage) {
    }

    async getListingsByCriteria(searchCriteria: SearchCriteria): Promise<Listing[]> {

        const criteriaToDBQuery = (listings: CollectionReference<DocumentData>, criteria: SearchCriteria): Query<DocumentData> => {
            let q = query(listings, where('purpose', '==', criteria.purpose?.trim() || 'For Rent'));
            if (criteria.location) q = query(q, where('location', '==', criteria.location.trim()));
            if (criteria.category) q = query(q, where('category', '==', criteria.category.trim()));

            switch (criteria.orderBy) {
                case 'Most Affordable':
                    q = query(q, orderBy('price', 'asc'));
                    break;
                case 'Most Recent':
                    q = query(q, orderBy('creationDate', 'desc'));
                    break;
                default:
                    break;
            }

            q = query(q, limit(this.paginationLimit));

            return q as Query<DocumentData>;
        }

        const propertySizesToMinMaxSizes = (propertySizes: string): number[] => {
            switch (propertySizes) {
                case '_050to100': return [50, 100];
                case '_100to200': return [100, 200];
                case '_200to300': return [200, 300];
                case '_300to400': return [300, 400];
                case '_400plus': return [400, 9999];
                default: return [0, 9999];
            }
        }

        this.searchInProgress$$.next(true);

        const results: Listing[] = [];
        const querySnapshot = await getDocs(
            criteriaToDBQuery(
                collection(this.firestore, FirestoreCollections.listings),
                searchCriteria
            ));

        if (querySnapshot?.size === 0) {
            this.searchInProgress$$.next(false);
            return [];
        }

        const minMaxSizes = propertySizesToMinMaxSizes(searchCriteria.propertySize);
        const minSize = minMaxSizes[0];
        const maxSize = minMaxSizes[1];

        const docs = querySnapshot.docs;
        for (let i = 0; i < docs.length; i++) {
            const doc = docs[i];
            const listing = doc.data() as Listing;

            // Range queries to be done here as Firestore does not allow it
            // Filter by property size
            if (
                listing.propertySize! > maxSize ||
                listing.propertySize! < minSize) {
                continue;
            }

            // Filter by max and min prices
            const maxPrice = searchCriteria.maxPrice || Number.POSITIVE_INFINITY;
            if (
                listing.price! > maxPrice ||
                listing.price! < searchCriteria.minPrice) {
                continue;
            }

            // Filter by bathrooms
            if (searchCriteria.bathrooms === "3+") {
                if (Number(listing.bathrooms) <= 3) {
                    continue;
                }
            } else if (searchCriteria.bathrooms) {
                if (Number(searchCriteria.bathrooms) != listing.bathrooms!) {
                    continue;
                }
            }

            // Filter by bedrooms
            if (searchCriteria.bedrooms === "3+") {
                if (Number(listing.bedrooms) <= 3) {
                    continue;
                }
            } else if (searchCriteria.bedrooms) {
                if (Number(searchCriteria.bedrooms) != listing.bedrooms!) {
                    continue;
                }
            }

            if (i == docs.length - 1) {
                this.lastResultOfCurrentPagination = doc;
            }

            results.push(listing);
        }

        this.searchInProgress$$.next(false);
        return results;
    }

    searchInProgress() {
        return this.searchInProgress$;
    }

    searchResults() {
        return this.searchResults$;
    }

    setSearchResults(value: Listing[]) {
        this.searchResults$$.next(value);
    }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  forkJoin,
  tap,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
} from 'rxjs';
import {
  IAbility,
  IAbilityDetail,
  IAbilityList,
  IPokeList,
  IPokemon,
  IPokemonDetail,
  ISelectOption,
} from '../models/poke.interface';

@Injectable({
  providedIn: 'root',
})
export class PokeService {
  constructor(private httpClient: HttpClient) {}

  public hardcoreObservable(): Observable<IPokemonDetail[]> {
    /** L'observable que tu va voir après ça va nous permettre de complexifier nos exos, mais il ne t'ai pas demandé de le comprendre :D */

    return this.httpClient
      .get<IPokeList>(`https://pokeapi.co/api/v2/pokemon/`)
      .pipe(
        switchMap((value: IPokeList) => {
          // switchMap permet de passer d'un observable à un autre, dans notre cas présent, on passe d'un appel pour récupérer la liste des pokemons, et on switch sur un appel qui récupère les 20 détails de cahque pokemon
          return forkJoin(
            // forkJoin permet de faire des appels d'observable groupé, dans notre cas, on prend les 20 pokemons dans la liste de pokemon, et on effectue 20 appels réseaux, une fois les appels réseaux effectués, on retourne les 20 résultats, ce qui nous donnera un tableau de PokemonDetail
            value.results.map((v) => this.httpClient.get<IPokemonDetail>(v.url))
          );
        }),
        shareReplay({ refCount: true, bufferSize: 1 }) // shareReplay est aussi un opérateur, il va permettre d'éviter que si 50 personnes subscribe à cet observable, le résulat soit partagé et non recalculé, évitant ainsi 50 appels * 20 à l'api
      );
  }

  public getTypes(): Observable<ISelectOption<number>[]> {
    // Modifier cette fonction pour renvoyer le type suivant Observable<ISelectOption<number>> depuis l'url https://pokeapi.co/api/v2/type
    return this.httpClient
      .get<IPokeList>('https://pokeapi.co/api/v2/type')
      .pipe(
        map((res: IPokeList) => {
          return res.results.map((res: IPokemon) => {
            return {
              value: +res.url
                .replace('https://pokeapi.co/api/v2/type/', '')
                .replace('/', ''),
              viewValue: res.name,
            };
          });
        })
      );
  }

  public getAbilities(): Observable<ISelectOption<number>[]> {
    // Modifier cette fonction pour renvoyer le type suivant Observable<ISelectOption<number>> depuis l'url https://pokeapi.co/api/v2/ability
    return this.httpClient
      .get<IAbilityList>('https://pokeapi.co/api/v2/ability?offset=0&limit=350')
      .pipe(
        map((res: IAbilityList) => {
          return res.results.map((res: IPokemon) => {
           //console.log(res);
            return {
              value: +res.url
                .replace('https://pokeapi.co/api/v2/ability/', '')
                .replace('/', ''),
              viewValue: res.name,
            };
          })
          .sort((a,b)=> a.viewValue > b.viewValue ? 1 : -1);
        }),
        tap(console.log)
      );
  }
}

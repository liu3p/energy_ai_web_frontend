import {inject, provide} from 'vue';
import {Observer, observerKey} from '../index';

export const provideObserver = () => {
    let observer = inject<Observer | null>(observerKey, null);
    if (observer === null) {
        observer = new Observer();
        provide(observerKey, observer);
    }
    return observer;
};

/**
 * Prüft, ob ein Jahr ein Schaltjahr ist.
 * @param year - Das Jahr, das überprüft werden soll.
 * @returns `true`, wenn das Jahr ein Schaltjahr ist, ansonsten `false`.
 */
export function isLeapYear(year: number): boolean {
    // Ein Jahr ist ein Schaltjahr, wenn es durch 4 teilbar ist,
    // aber nicht durch 100, es sei denn, es ist auch durch 400 teilbar.
    if (year % 4 === 0) {
        if (year % 100 === 0) {
            return year % 400 === 0;
        }
        return true;
    }
    return false;
}

import {chapterSixFinaleStart} from '../../src/dev/canonical-saves';
import {arrival} from '../../src/content/maps';
/** The real saved crown arrival, before the introduction's completion flag. */
export function imperialEntryCheckpoint(recovered=true){
 const s=chapterSixFinaleStart(recovered);
 s.flags.capitalWarningSeen=true;s.flags.capitalAssaultCommitted=true;s.flags.capitalRiskAccepted=!recovered;
 s.location=arrival('crown','start');return s;
}

import { LoginSource , GenderType  } from "../../enums/enums";
import { IBaseEntity } from "./ibaseentity";
import { SpecialisationDTO } from '../dtos/specialisationdto';
import { NationalityDTO } from '../dtos/nationalitydto';
import { LanguageDTO } from '../dtos/languagedto';
import { ReligionDTO } from '../dtos/religiondto';
import { AffiliationDTO } from '../dtos/affiliationdto';
import { QualificationDTO } from "../dtos/qualificationdto";
import { InstitutionDTO } from "../dtos/institutiondto";
import { TargetedAgeGroupDTO } from "../dtos/targetedagegroupdto";

export class Professionals implements IBaseEntity {
    id: string = "";
    name: string = "";
    minAge: string = "";
    maxAge: string = "";
    targetedAgeGroup: TargetedAgeGroupDTO = <TargetedAgeGroupDTO>{};
    profilePicture: string = "";
    email: string = "";

    specialisation: SpecialisationDTO = <SpecialisationDTO>{};

    qualification: QualificationDTO = <QualificationDTO>{};
    introduction: string = "";
    experience: string = "";
    affiliation: AffiliationDTO = <AffiliationDTO>{};
    practice: string = "";
    institution: InstitutionDTO = <InstitutionDTO>{} ;

    gender: GenderType | undefined =  undefined;
    language: LanguageDTO = <LanguageDTO>{};
    nationality: NationalityDTO = <NationalityDTO>{};
    price: number = 0;
    religion: ReligionDTO = <ReligionDTO>{};

    isEmailVerified: boolean = false;
    loginSource: LoginSource = LoginSource.default;
    status: boolean = true;
    createdOnDate: number = new Date().getTime();
}

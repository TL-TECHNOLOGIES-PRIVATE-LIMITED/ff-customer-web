import React from 'react';
import UnderMaintenanceSVG from "../../utils/under_maintenance.svg";
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import "./maintenance.css";

const Maintenance = () => {
    const { t } = useTranslation();
    const setting = useSelector(state => state.setting);

    return (
        <div className='underMaintenanceContainer d-flex flex-column justify-content-center align-items-center'>
            <img src={UnderMaintenanceSVG} alt='underMaintenanceSVG' loading='lazy' />
            <div className='underMaintenanceText'>{t("under_maintenance")}</div>
            <div className='underMaintenanceSubText'>{setting?.setting?.web_settings?.website_mode === "1" ? setting?.setting?.web_settings?.website_mode_remark : null}</div>
        </div>
    );
};

export default Maintenance;
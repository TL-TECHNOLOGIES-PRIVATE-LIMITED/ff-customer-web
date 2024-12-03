import React, { useEffect, useState } from 'react';
import '../transaction/transaction.css';
import api from '../../api/api';
import { FaRupeeSign } from "react-icons/fa";
import Loader from '../loader/Loader';
import Pagination from 'react-js-pagination';
import No_Transactions from '../../utils/zero-state-screens/No_Transaction.svg';
import { useTranslation } from 'react-i18next';
import { PiWallet } from 'react-icons/pi';
import AddWalletModal from './AddWalletModal';
import { ValidateNoInternet } from '../../utils/NoInternetValidator';
import { MdSignalWifiConnectedNoInternet0 } from 'react-icons/md';
import { useSelector } from 'react-redux';


const WalletTransaction = () => {

    const user = useSelector(state => state.user);
    const total_transactions_per_page = 10;

    const type = 'wallet';


    const [transactions, settransactions] = useState(null);
    const [totalTransactions, settotalTransactions] = useState(null);
    const [offset, setoffset] = useState(0);
    const [currPage, setcurrPage] = useState(1);
    const [isLoader, setisLoader] = useState(false);
    const [addWalletModal, setAddWalletModal] = useState(false);
    const [isNetworkError, setIsNetworkError] = useState(false);

    const fetchTransactions = () => {
        api.getTransactions(user?.jwtToken, total_transactions_per_page, offset, type)
            .then(response => response.json())
            .then(result => {
                // console.log(result, 'transREsult')
                if (result.status === 1) {
                    setisLoader(false);
                    settransactions(result.data);
                    // console.log(result.data,'transactionssss')
                    settotalTransactions(result.total);
                }
                // else{
                //     setisLoader(false)
                //     toast.error('No Transaction Found')
                // }
            }).catch(err => {
                const isNoInternet = ValidateNoInternet(err);
                if (isNoInternet) {
                    setIsNetworkError(true);
                }
            });
    };

    useEffect(() => {
        setisLoader(true);
        // if (addWalletModal === false)
        fetchTransactions();
        // eslint-disable-next-line

    }, [offset]);


    const convertToAMPM = (transactionDate) => {
        const dateTimeObj = new Date(transactionDate);
        const options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
        const timeInAMPMFormat = dateTimeObj.toLocaleString('en-US', options);
        return timeInAMPMFormat;
    };

    //page change
    const handlePageChange = (pageNum) => {
        setcurrPage(pageNum);
        setoffset(pageNum * total_transactions_per_page - total_transactions_per_page);
    };
    const { t } = useTranslation();
    return (
        <>
            {!isNetworkError ?
                <div className='transaction-list pe-5'>
                    <div className='heading d-flex justify-content-between align-items-center'>
                        {t("wallet_transactions")}
                        <div>
                            <button type='button' className='addMoneyBtn'
                                onClick={() => setAddWalletModal(true)}
                            >
                                <PiWallet className='me-2' fill='white' />
                                {t("add_money")}
                            </button>
                        </div>
                    </div>
                    {transactions === null
                        ? (
                            <div className='my-5'><Loader width='100%' height='350px' /></div>
                        )
                        : (
                            <>
                                {isLoader ? <div className='my-5'><Loader width='100%' height='350px' /></div>
                                    : (<>
                                        {transactions.length === 0
                                            ? <><div className='d-flex align-items-center p-4 no-transaction'>
                                                <img src={No_Transactions} alt='no-orders'></img>
                                                <p>{t("no_transaction")}</p>
                                            </div></>
                                            : <>
                                                <table className='transaction-list-table'>
                                                    <thead>
                                                        <tr>
                                                            <th>{t("transactions")} {t("id")}</th>
                                                            <th>Message</th>
                                                            <th>{t("transactions")} {t("date")}</th>
                                                            <th>{t("amount")}</th>
                                                            <th>{t("status")}</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {transactions?.map((transaction, index) => (
                                                            <tr key={index} className={index === transactions.length - 1 ? 'last-column' : ''}>
                                                                <th>{transaction.id}</th>
                                                                {/* <th>{transaction?.txn_id}</th> */}
                                                                <th>

                                                                    {transaction.order_id == null && transaction.order_item_id == null ? transaction.message : ''
                                                                    }

                                                                    {
                                                                        transaction.order_id != null || transaction.order_id != null && transaction.order_item_id != null || transaction.order_item_id != null && transaction.type == "debit" ?
                                                                            `${t("order_placed")}-${t("order_id")}:${transaction.order_id}`
                                                                            :
                                                                            ""
                                                                    }

                                                                    {
                                                                        transaction.order_id != null || transaction.order_id != null && transaction.order_item_id != null || transaction.order_item_id != null && transaction.type == "credit" ?
                                                                            `${transaction.message}-${t("order_id")}:${transaction?.order_id}`
                                                                            :
                                                                            ""
                                                                    }


                                                                </th>
                                                                <th >
                                                                    {`${new Date(transaction.created_at).getDate()}-${new Date(transaction.created_at).getMonth() + 1}-${new Date(transaction.created_at).getFullYear()}`}
                                                                    <p>{convertToAMPM(transaction.created_at)}</p>

                                                                </th>


                                                                <th className='amount'><FaRupeeSign fill='var(--secondary-color)' />{transaction.amount}</th>


                                                                <th className={transaction.status == 'credit' ? 'success' : 'failed'}><p>{t(`${transaction.status}`)}</p></th>
                                                            </tr>
                                                        ))
                                                        }
                                                    </tbody>
                                                </table>
                                            </>
                                        }
                                    </>
                                    )}

                                {transactions.length !== 0 ?
                                    <Pagination
                                        itemClass='transactionItems'
                                        activePage={currPage}
                                        itemsCountPerPage={total_transactions_per_page}
                                        totalItemsCount={totalTransactions}
                                        pageRangeDisplayed={5}
                                        onChange={handlePageChange.bind(this)}
                                    />
                                    : null}
                                <AddWalletModal showModal={addWalletModal} setShowModal={setAddWalletModal} fetchTransactions={fetchTransactions} />
                            </>

                        )}
                </div>
                :
                <div className='d-flex flex-column justify-content-center align-items-center noInternetContainer'>
                    <MdSignalWifiConnectedNoInternet0 />
                    <p>{t("no_internet_connection")}</p>
                </div>
            }
        </>
    );
};

export default WalletTransaction;
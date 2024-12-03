import React, { useEffect, useState } from 'react';
import './transaction.css';
import api from '../../api/api';
import { FaRupeeSign } from "react-icons/fa";
import Loader from '../loader/Loader';
import Pagination from 'react-js-pagination';
import No_Transactions from '../../utils/zero-state-screens/No_Transaction.svg';
import { useTranslation } from 'react-i18next';
import { ValidateNoInternet } from '../../utils/NoInternetValidator';
import { MdSignalWifiConnectedNoInternet0 } from 'react-icons/md';
import { useSelector } from 'react-redux';


const Transaction = () => {


    const { t } = useTranslation();
    const total_transactions_per_page = 10;
    const type = 'transactions';

    const user = useSelector(state => state.user);

    const [transactions, settransactions] = useState(null);
    const [totalTransactions, settotalTransactions] = useState(null);
    const [offset, setoffset] = useState(0);
    const [currPage, setcurrPage] = useState(1);
    const [isLoader, setisLoader] = useState(false);
    const [isNetworkError, setIsNetworkError] = useState(false);


    const fetchTransactions = () => {
        api.getTransactions(user?.jwtToken, total_transactions_per_page, offset, type)
            .then(response => response.json())
            .then(result => {
                // console.log(result,'transREsult')
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
                setisLoader(false)
            }).catch(err => {
                const isNoInternet = ValidateNoInternet(err);
                if (isNoInternet) {
                    setIsNetworkError(true);
                }
            });
    };

    useEffect(() => {
        setisLoader(true);
        fetchTransactions();
        // eslint-disable-next-line

    }, [offset]);

    //page change
    const handlePageChange = (pageNum) => {
        setcurrPage(pageNum);
        setoffset(pageNum * total_transactions_per_page - total_transactions_per_page);
    };
    return (
        <>
            {!isNetworkError ?
                <div className='transaction-list'>
                    <div className='heading'>
                        {t("transactions")}
                    </div>
                    {transactions === null
                        ? (
                            <div className='my-5'><Loader width='100%' height='350px' /></div>
                        )
                        : (
                            <>
                                {isLoader ? <div className='my-5'><Loader width='100%' height='500px' /></div>
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
                                                            <th>{t("payment_method")}</th>
                                                            <th>{t("transactions")} {t("date")}</th>
                                                            <th>{t("amount")}</th>
                                                            <th>{t("status")}</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>

                                                        {transactions.map((transaction, index) => (
                                                            <tr key={index} className={index === transactions.length - 1 ? 'last-column' : ''}>
                                                                {/* <th>{transaction.id}</th> */}
                                                                <th>{transaction?.txn_id}</th>
                                                                <th>{transaction.type}</th>
                                                                <th>{`${new Date(transaction.created_at).getDate()}-${new Date(transaction.created_at).getMonth() + 1}-${new Date(transaction.created_at).getFullYear()}`}</th>
                                                                <th className='amount'><FaRupeeSign fill='var(--secondary-color)' />{transaction.amount}</th>
                                                                <th className={transaction.status === 'failed' ? 'failed' : 'success'}><p>{t(`${transaction.status}`)}</p></th>
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

export default Transaction;
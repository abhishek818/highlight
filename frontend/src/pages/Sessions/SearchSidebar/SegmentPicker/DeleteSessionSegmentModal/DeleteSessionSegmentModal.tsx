import { namedOperations } from '@graph/operations';
import { message } from 'antd';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import Button from '../../../../../components/Button/Button/Button';
import { CircularSpinner } from '../../../../../components/Loading/Loading';
import Modal from '../../../../../components/Modal/Modal';
import { useDeleteSegmentMutation } from '../../../../../graph/generated/hooks';
import { SearchParams } from '../../../SearchContext/SearchContext';
import styles from '../SegmentPicker.module.scss';

const NO_SEGMENT = 'none';

interface Props {
    showModal: boolean;
    hideModalHandler: () => void;
    segmentToDelete: { name?: string; id?: string } | null;
    /** Called after a segment is deleted. */
    afterDeleteHandler?: () => void;
}

const DeleteSessionSegmentModal: React.FC<Props> = ({
    hideModalHandler,
    showModal,
    segmentToDelete,
    afterDeleteHandler,
}) => {
    const { segment_id, organization_id } = useParams<{
        segment_id: string;
        organization_id: string;
    }>();
    const history = useHistory<SearchParams>();
    const [deleteSegment, { loading }] = useDeleteSegmentMutation({
        update(cache) {
            cache.modify({
                fields: {
                    segments(existingSegments, { readField }) {
                        return existingSegments.filter(
                            (existingSegment: any) =>
                                readField('id', existingSegment) !==
                                segmentToDelete?.id
                        );
                    },
                },
            });
        },
        refetchQueries: [namedOperations.Query.GetSegments],
    });

    return (
        <Modal
            title="Delete Segment"
            visible={showModal}
            onCancel={hideModalHandler}
            style={{ display: 'flex' }}
            width={400}
        >
            <div>
                <p className={styles.modalSubTitle}>
                    {`This action is irreversible. Do you want to delete ${
                        segmentToDelete?.name
                            ? `'${segmentToDelete.name}'`
                            : 'this segment'
                    }?`}
                </p>
                <div className={styles.actionsContainer}>
                    <Button
                        trackingId="CancelDeleteSessionSegment"
                        onClick={hideModalHandler}
                    >
                        Cancel
                    </Button>
                    <Button
                        trackingId="DeleteSessionSegment"
                        type="primary"
                        onClick={() => {
                            deleteSegment({
                                variables: {
                                    segment_id:
                                        segmentToDelete?.id || NO_SEGMENT,
                                },
                            })
                                .then(() => {
                                    message.success('Deleted Segment!', 5);
                                    hideModalHandler();
                                    if (segment_id === segmentToDelete?.id) {
                                        history.push(
                                            `/${organization_id}/sessions`
                                        );
                                    }
                                    if (afterDeleteHandler) {
                                        afterDeleteHandler();
                                    }
                                })
                                .catch(() => {
                                    message.error('Error deleting segment!', 5);
                                });
                        }}
                    >
                        {loading ? (
                            <CircularSpinner
                                style={{
                                    fontSize: 18,
                                    color: 'var(--text-primary-inverted)',
                                }}
                            />
                        ) : (
                            'Delete Segment'
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteSessionSegmentModal;

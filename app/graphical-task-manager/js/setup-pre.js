
// Cache manifest
{
    function onUpdateReady() {
        console.log('found new version!');
    }
    window.applicationCache.addEventListener('updateready', onUpdateReady);
    if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
        onUpdateReady();
    }
}